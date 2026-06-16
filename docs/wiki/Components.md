# Components

UI modules in `src/components/` and how they interact with `App.tsx`.

## Layout flow

```
Header
Main
  ├── DropZone          (no file loaded)
  └── File workspace    (file loaded)
        ├── SettingsPanel
        ├── ProgressTracker
        ├── Downloader
        └── SubtitleGrid
Footer
```

## Header

**File:** `src/components/Header.tsx`

- App title and GitHub link
- Light/dark theme toggle via `useTheme` hook
- Persists preference to `localStorage`

## DropZone

**File:** `src/components/DropZone.tsx`

- Drag-and-drop and file picker for `.srt` files
- Reads file content in-browser via `FileReader`
- Calls `onFileLoaded(name, content)` → `App` runs `parseSRT`

## SettingsPanel

**File:** `src/components/SettingsPanel.tsx`

Controls passed from `App.tsx`:

| Control | State key |
|---------|-----------|
| Source language | `sourceLang` |
| Target language | `targetLang` |
| Chunk size | `chunkSize` |
| Delay | `delay` |
| Concurrency | `concurrency` |

Imports `SUPPORTED_LANGUAGES` from `translator.ts`. Language swap is disabled when source is `auto`.

## ProgressTracker

**File:** `src/components/ProgressTracker.tsx`

- Progress bar: completed blocks / total blocks
- Scrollable log output
- Start, pause, and cancel actions
- Cancel triggers full reset via `App.handleReset`

## Downloader

**File:** `src/components/Downloader.tsx`

- Merges original timestamps with translated text lines
- Uses `stringifySRT()` to build output
- Triggers browser download of translated `.srt`

## SubtitleGrid

**File:** `src/components/SubtitleGrid.tsx`

- Side-by-side original and translated columns
- Search filter across block text
- Inline edit with save/cancel per block
- RTL alignment via `isRTL()` from `rtl.ts` (Hebrew, Arabic, Persian)

## State ownership

All translation state lives in `App.tsx`:

- `blocks` — parsed subtitle blocks
- `translatedBlocks` — map of index → translated line arrays
- `isTranslating`, `logs`, `abortRef` — run control

Components are presentational; they receive props and callbacks only.

## Related

- [Architecture](Architecture)
- [Development](Development)
