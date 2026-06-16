# FAQ

Common questions and troubleshooting.

## General

### Does my file get uploaded to a server?

No. The app runs entirely in your browser. Subtitle content stays in memory on your device. Translation requests go directly from your browser to Google Translate.

### What file formats are supported?

SubRip `.srt` only. Other formats (`.vtt`, `.ass`) are not supported.

### Which languages are supported?

Any language pair supported by Google Translate. The settings panel lists 100+ languages plus auto-detect for the source.

## Translation issues

### Translation is slow

Large files have many blocks. Defaults are tuned for rate-limit safety:

- Increase **chunk size** (fewer API calls, but higher delimiter mismatch risk)
- Increase **concurrency** carefully (max 2–3; higher values trigger HTTP 429)

### I see "Rate limit" or HTTP 429 errors

Google's free endpoint throttles aggressive parallel use:

- Lower **concurrency** to 1 or 2
- Increase **delay** between batches
- Wait a few minutes and resume (already-translated blocks are kept)

### Some lines are untranslated or wrong

Possible causes:

- Delimiter was altered by the translation engine → binary fallback should recover most blocks
- Very short or symbolic text may pass through unchanged
- Edit lines manually in the **Subtitle grid** before downloading

### Delimiter mismatch warnings

The engine uses ` [xyz999] ` between batched blocks. If Google changes spacing or brackets, the splitter uses a tolerant regex and falls back to smaller sub-batches automatically.

## UI

### Dark mode flashes on load

Theme is set in `index.html` before paint and persisted in `localStorage`. If you still see a flash, clear site data and reload.

### RTL text looks misaligned

Hebrew, Arabic, and Persian use right-to-left alignment in the grid via `isRTL()`. Mixed LTR/RTL in one line follows Unicode bidirectional rules in the browser.

## Development

### Build fails on TypeScript errors

Run `npm run build` locally. Fix all `tsc` errors before pushing — CI blocks deploy on failure.

### Local dev works but GitHub Pages shows a blank page

Check that asset paths use the Vite base path. Open devtools Network tab on the live site for 404s under `/Universal-Subtitle-Translator/assets/`.

## Related

- [Translation pipeline](Translation-Pipeline)
- [Development](Development)
