#!/usr/bin/env python3
"""
Universal Subtitle Translator
Translates .srt files between any language pair using Google Translate
via deep-translator. Uses chunk-bundling to minimize API requests.

Usage:
    python translate.py --input input.srt --output output.srt --target spanish
    python translate.py --input input.srt --output output.srt --target es
    python translate.py --input input.srt --output output.srt --target hebrew --source auto
"""

import os
import sys
import json
import time
import argparse

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("Error: deep-translator is not installed.")
    print("Install it with: pip install deep-translator")
    print("  or, in a venv: .venv/bin/pip install deep-translator")
    sys.exit(1)


# ── Configuration ─────────────────────────────────────────────────────────────

MAX_CHUNK_CHARACTERS = 4000   # Google Translate's soft limit is ~5000 chars
DELAY_BETWEEN_CHUNKS = 1.0    # Seconds between API calls to avoid rate limits
DELIMITER = " [###] "         # Must be unlikely to appear in normal subtitle text

# Some language names need remapping because Google uses legacy codes
LEGACY_CODE_MAP = {
    "hebrew": "iw",
    "he": "iw",
}


# ── Language Resolution ────────────────────────────────────────────────────────

def resolve_language_code(lang_str: str) -> str:
    """
    Convert a human-readable language name or code to a Google Translate
    language code. Handles legacy codes (e.g. Hebrew = 'iw') automatically.
    """
    if lang_str == "auto":
        return "auto"

    val = lang_str.lower().strip()

    # Check legacy code map first
    if val in LEGACY_CODE_MAP:
        return LEGACY_CODE_MAP[val]

    # Fetch all supported languages from Google Translate
    try:
        langs_dict = GoogleTranslator().get_supported_languages(as_dict=True)
    except Exception as e:
        print(f"Warning: could not fetch supported language list: {e}")
        # Fall back to using the code as-is
        return lang_str

    # langs_dict maps name -> code (e.g. {"spanish": "es", ...})
    langs_lower = {k.lower(): v for k, v in langs_dict.items()}
    codes = set(langs_dict.values())

    # Already a valid code?
    if val in codes:
        return val

    # Full language name?
    if val in langs_lower:
        return langs_lower[val]

    print(f"Error: Language '{lang_str}' is not recognized.")
    print("Run this to see all supported languages:")
    print("  python -c \"from deep_translator import GoogleTranslator; "
          "print(GoogleTranslator().get_supported_languages())\"")
    sys.exit(1)


# ── SRT Parser ────────────────────────────────────────────────────────────────

def parse_srt(file_path: str) -> list[dict]:
    """
    Parse an SRT file into a list of subtitle block dicts.

    Each dict has:
        index       (int)   — the subtitle sequence number
        timestamp   (str)   — the raw timestamp line, e.g. "00:01:23,456 --> 00:01:25,000"
        text_lines  (list)  — the text lines of the block (may be multi-line)
    """
    blocks = []
    current_block = None

    with open(file_path, "r", encoding="utf-8-sig") as f:  # utf-8-sig strips BOM
        for raw_line in f:
            line = raw_line.replace("\r", "").replace("\n", "")
            trimmed = line.strip()

            if not trimmed:
                # Blank line = end of a block
                if current_block:
                    blocks.append(current_block)
                    current_block = None
                continue

            if current_block is None:
                if trimmed.isdigit():
                    current_block = {
                        "index": int(trimmed),
                        "timestamp": "",
                        "text_lines": [],
                    }
            elif not current_block["timestamp"]:
                if "-->" in trimmed:
                    current_block["timestamp"] = line
                else:
                    # Malformed block — reset
                    current_block = None
            else:
                current_block["text_lines"].append(line)

    if current_block:
        blocks.append(current_block)

    return blocks


# ── Progress Cache ─────────────────────────────────────────────────────────────

def load_progress(progress_path: str) -> dict[int, list[str]]:
    """Load previously translated blocks from a checkpoint file."""
    if os.path.exists(progress_path):
        try:
            with open(progress_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {int(k): v for k, v in data.get("translated_blocks", {}).items()}
        except Exception:
            pass
    return {}


def save_progress(progress: dict[int, list[str]], progress_path: str) -> None:
    """Persist the current translation state to disk."""
    with open(progress_path, "w", encoding="utf-8") as f:
        json.dump(
            {"translated_blocks": {str(k): v for k, v in progress.items()}},
            f,
            ensure_ascii=False,
            indent=2,
        )


# ── Chunking ──────────────────────────────────────────────────────────────────

def build_chunks(
    to_translate: list[tuple[int, str]],
    max_chars: int = MAX_CHUNK_CHARACTERS,
) -> list[list[tuple[int, str]]]:
    """
    Group (index, text) pairs into chunks that fit within max_chars.
    The delimiter overhead is accounted for so no chunk exceeds the limit.
    """
    chunks = []
    current_chunk: list[tuple[int, str]] = []
    current_len = 0

    for idx, text in to_translate:
        addition_len = len(text) + (len(DELIMITER) if current_chunk else 0)
        if current_chunk and current_len + addition_len > max_chars:
            chunks.append(current_chunk)
            current_chunk = [(idx, text)]
            current_len = len(text)
        else:
            current_chunk.append((idx, text))
            current_len += addition_len

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


# ── Translation ───────────────────────────────────────────────────────────────

def translate_with_retry(
    translator: GoogleTranslator,
    text: str,
    max_retries: int = 3,
    base_delay: float = 2.0,
) -> str:
    """Translate text with exponential back-off on failure."""
    for attempt in range(max_retries):
        try:
            result = translator.translate(text)
            return result if result else text
        except Exception as e:
            if attempt < max_retries - 1:
                wait = base_delay * (2 ** attempt)
                print(f"  Retry {attempt + 1}/{max_retries - 1} after error: {e} (waiting {wait:.0f}s)")
                time.sleep(wait)
            else:
                raise


def translate_chunk(
    translator: GoogleTranslator,
    chunk: list[tuple[int, str]],
    progress: dict[int, list[str]],
) -> None:
    """
    Translate a single chunk of subtitle blocks.

    Bundles all texts into one API request. If the delimiter gets garbled
    by the translation engine and the response can't be cleanly split,
    falls back to translating each block individually.
    """
    if len(chunk) == 1:
        idx, text = chunk[0]
        translated = translate_with_retry(translator, text)
        progress[idx] = translated.split("\n")
        return

    texts = [text for _, text in chunk]
    combined = DELIMITER.join(texts)

    try:
        translated_combined = translate_with_retry(translator, combined)
        parts = [p.strip() for p in translated_combined.split("[###]")]

        if len(parts) == len(chunk):
            for (idx, _), part in zip(chunk, parts):
                progress[idx] = part.split("\n")
        else:
            # Delimiter was corrupted — fall back to individual translation
            print(f"  Warning: delimiter mismatch ({len(parts)} parts for {len(chunk)} blocks). "
                  "Falling back to individual translation for this chunk.")
            for idx, text in chunk:
                translated = translate_with_retry(translator, text)
                progress[idx] = translated.split("\n")

    except Exception as e:
        print(f"  Error translating chunk: {e}. Attempting individual fallback.")
        for idx, text in chunk:
            try:
                translated = translate_with_retry(translator, text)
                progress[idx] = translated.split("\n")
            except Exception as inner_e:
                print(f"  Skipping block {idx}: {inner_e}")
                # Keep original text rather than losing the block entirely
                progress[idx] = text.split("\n")


# ── Output Writer ─────────────────────────────────────────────────────────────

def write_output(
    blocks: list[dict],
    progress: dict[int, list[str]],
    output_path: str,
) -> None:
    """Assemble the final SRT file from translated blocks."""
    with open(output_path, "w", encoding="utf-8") as f:
        for i, block in enumerate(blocks):
            idx = block["index"]
            translated_lines = progress.get(idx, block["text_lines"])

            f.write(f"{idx}\n")
            f.write(f"{block['timestamp']}\n")
            for line in translated_lines:
                f.write(f"{line}\n")
            # Blank line between blocks (omit after last one)
            if i < len(blocks) - 1:
                f.write("\n")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Translate .srt subtitle files between any language pair.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python translate.py -i movie.srt -o movie_es.srt -t spanish
  python translate.py -i movie.srt -o movie_he.srt -t hebrew
  python translate.py -i movie.srt -o movie_zh.srt -t "chinese (simplified)"
  python translate.py -i movie.srt -o movie_fr.srt -t fr -s en
        """,
    )
    parser.add_argument("-i", "--input", required=True, help="Path to the input .srt file")
    parser.add_argument("-o", "--output", required=True, help="Path for the translated output .srt file")
    parser.add_argument("-t", "--target", required=True, help="Target language name or code (e.g. 'spanish', 'es', 'hebrew')")
    parser.add_argument("-s", "--source", default="auto", help="Source language name or code (default: auto-detect)")
    parser.add_argument("-p", "--progress", default=None, help="Path for the progress checkpoint file (default: auto)")
    args = parser.parse_args()

    # Resolve language codes
    source_code = resolve_language_code(args.source)
    target_code = resolve_language_code(args.target)

    # Default progress file lives next to the output
    progress_path = args.progress or os.path.join(
        os.path.dirname(os.path.abspath(args.output)),
        "translation_progress.json",
    )

    print(f"Input:    {args.input}")
    print(f"Output:   {args.output}")
    print(f"Source:   {source_code}")
    print(f"Target:   {target_code}")
    print()

    # Parse
    print("Parsing SRT file...")
    blocks = parse_srt(args.input)
    print(f"Found {len(blocks)} subtitle blocks.")

    # Load checkpoint
    progress = load_progress(progress_path)
    already_done = len(progress)
    if already_done:
        print(f"Resuming from checkpoint: {already_done} blocks already translated.")

    # Collect what still needs translation
    to_translate: list[tuple[int, str]] = []
    for block in blocks:
        idx = block["index"]
        if idx in progress:
            continue
        text = "\n".join(block["text_lines"]).strip()
        if not text:
            progress[idx] = block["text_lines"]  # Empty blocks pass through
            continue
        to_translate.append((idx, text))

    if not to_translate:
        print("All blocks already translated. Writing output...")
        write_output(blocks, progress, args.output)
        print(f"Done! Output saved to: {args.output}")
        return

    print(f"Translating {len(to_translate)} remaining blocks...")

    # Build chunks and translate
    translator = GoogleTranslator(source=source_code, target=target_code)
    chunks = build_chunks(to_translate)
    total_chunks = len(chunks)

    for i, chunk in enumerate(chunks, 1):
        block_range = f"{chunk[0][0]}–{chunk[-1][0]}" if len(chunk) > 1 else str(chunk[0][0])
        print(f"  Chunk {i}/{total_chunks} (blocks {block_range}, {sum(len(t) for _, t in chunk)} chars)...", end=" ", flush=True)

        try:
            translate_chunk(translator, chunk, progress)
            save_progress(progress, progress_path)
            print("done")
        except Exception as e:
            save_progress(progress, progress_path)
            print(f"FAILED: {e}")
            print(f"Progress saved to {progress_path}. Re-run the same command to resume.")
            sys.exit(1)

        if i < total_chunks:
            time.sleep(DELAY_BETWEEN_CHUNKS)

    # Write final output
    print(f"\nWriting output to {args.output}...")
    write_output(blocks, progress, args.output)

    # Clean up checkpoint (translation is complete)
    if os.path.exists(progress_path):
        os.remove(progress_path)

    print(f"Done! Translated {len(blocks)} subtitle blocks.")


if __name__ == "__main__":
    main()
