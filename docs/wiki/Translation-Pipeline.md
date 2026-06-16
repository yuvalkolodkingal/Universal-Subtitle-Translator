# Translation pipeline

How subtitle blocks move from an uploaded `.srt` file to a translated download.

## Overview

```
.srt file → parseSRT → batch by char limit → worker pool → Google Translate → split by delimiter → grid + download
```

Large files can contain thousands of blocks. Translating each block individually would be slow and quickly hit rate limits. The engine bundles many blocks into one request, then splits the response back apart.

## Step 1: Parse

`parseSRT()` in `src/utils/srtParser.ts`:

- Normalizes CRLF/LF line endings
- Strips UTF-8 BOM
- Splits on blank lines into blocks with index, timestamp, and text lines

## Step 2: Batch

`App.tsx` collects pending (untranslated) blocks and groups them into character-bounded batches:

- Default chunk size: **1500 characters**
- Delimiter overhead per block: **9 characters** (` [xyz999] `)
- When adding the next block would exceed the limit, a new batch starts

## Step 3: Worker pool

Translation runs through a concurrent worker pool:

- Default concurrency: **2** parallel batches
- Cool-down delay between batches: **1.5 s** (configurable in Settings)
- Pause/abort sets a flag checked throughout the loop

Higher concurrency (>3) can trigger HTTP 429 rate limits from Google.

## Step 4: Translate

`translateBatch()` in `src/utils/translator.ts`:

1. Joins block texts with delimiter ` [xyz999] `
2. Calls Google Translate free endpoint (`client=gtx`)
3. Splits response with regex `/\s*\[\s*xyz999\s*\]\s*/gi`
4. Maps each part back to the original block index

### Retries

Single requests retry up to **4 times** with exponential back-off. HTTP 429 waits longer before retrying.

## Step 5: Fallback

If the delimiter count does not match the batch size, or the batch request fails:

- **Binary sub-batch fallback** (`translateSubBatches`)
- Splits the batch in half recursively until single-block translation
- On single-block failure, keeps the original text

This ensures no block is silently dropped.

## Step 6: Output

- Progress updates stream into `ProgressTracker` logs
- Translated lines appear in `SubtitleGrid` (editable)
- `Downloader` calls `stringifySRT()` to produce the final `.srt`

## Settings that affect the pipeline

| Setting | Default | Effect |
|---------|---------|--------|
| Source language | Auto | Passed as `sl` to Google |
| Target language | Spanish | Passed as `tl` to Google |
| Chunk size | 1500 | Max characters per batch |
| Delay | 1.5 s | Pause between batch completions |
| Concurrency | 2 | Parallel worker threads |

## Related

- [Architecture](Architecture)
- [FAQ](FAQ)
