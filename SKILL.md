---
name: universal-subtitle-translator
description: Translate subtitle (.srt) files between any languages using high-speed chunk-bundling and deep-translator. Trigger this skill whenever the user asks to translate subtitle files, .srt files, or video captions to any language — whether it's English to Spanish, Japanese to French, Arabic to Portuguese, or any other combination. Use this skill even if the user just says "translate my subtitles" or "convert these captions."
---

# Universal Subtitle Translator Skill

Use this skill when the user wants to translate `.srt` subtitle files from any language to any other language. The bundled `scripts/translate.py` handles everything — parsing, chunked translation, progress caching, and clean output — so focus on running it correctly rather than reinventing the logic.

## Environment Setup

On systems with managed Python environments (Arch Linux, Homebrew Python, etc.), always create a local virtual environment first to avoid permission errors:

```bash
python -m venv .venv
.venv/bin/pip install --upgrade pip deep-translator
```

On standard systems where `pip install` works globally, that's fine too.

## Running the Translation

```bash
.venv/bin/python scripts/translate.py \
  --input path/to/input.srt \
  --output path/to/output.srt \
  --target <language>
```

**`--target`** accepts both language names and codes interchangeably:
- `"spanish"` or `"es"`
- `"hebrew"` or `"iw"` (Google uses the legacy code `iw` for Hebrew — the script handles this automatically)
- `"chinese (simplified)"` or `"zh-CN"`
- `"arabic"`, `"french"`, `"japanese"`, etc.

**`--source`** is optional and defaults to `"auto"` (automatic detection). Set it explicitly if auto-detection misbehaves for short or ambiguous subtitles.

**`--progress`** is optional. Defaults to a `translation_progress.json` file next to the output. If a translation is interrupted and you run the same command again, the script resumes from the checkpoint rather than starting over.

## How It Works (why this approach matters)

Subtitle files often have thousands of blocks. Translating them one at a time would take 10–20 minutes and quickly hit Google's rate limits. The script bundles up to 4000 characters of subtitle text into a single API request using a `[###]` delimiter, then splits the translated result back into blocks. This cuts the number of requests by ~98% and translates an entire file in under a minute.

If a chunk comes back with a mismatched number of parts (which occasionally happens when Google alters the delimiter), the script automatically falls back to translating that chunk's blocks individually, so nothing is silently dropped.

## After Translation

Check the output with:
- **Encoding**: confirm UTF-8, especially for non-Latin scripts (Hebrew, Arabic, Chinese, Japanese)
- **Block count**: the number of subtitle blocks should match the original
- **Timestamps**: must be preserved exactly as-is
- **RTL languages**: Hebrew and Arabic display right-to-left naturally in media players that support it; the file format itself does not need special handling

## Troubleshooting

| Problem | Fix |
|---|---|
| `ModuleNotFoundError: deep_translator` | Run the venv setup command above |
| Translation looks garbled or cut off | The delimiter got altered — this triggers automatic per-block fallback; check the console for warnings |
| Rate limit / connection error mid-file | Run the same command again; progress is saved and it will resume |
| Output file has wrong character encoding | Ensure your editor opens it as UTF-8 |
| Language not recognized | Run `python -c "from deep_translator import GoogleTranslator; print(GoogleTranslator().get_supported_languages())"` to see all supported names |
