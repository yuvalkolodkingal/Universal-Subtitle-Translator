# Agent Guidelines

## Project

| Field | Value |
|-------|-------|
| Stack | TypeScript 5.2, React 18, Vite 5, Tailwind CSS 3 |
| Type | Client-side SPA — in-browser `.srt` subtitle translator |
| Entry | `src/main.tsx` → `src/App.tsx` |
| Deploy target | GitHub Pages at `/Universal-Subtitle-Translator/` |

## Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Local dev server (`http://localhost:5173`) |
| `npm run build` | Type-check (`tsc`) + production bundle (`vite build`) — **required before commit** |
| `npm run preview -- --port 4173` | Serve production build locally |

<!-- GENERATED:START ci -->
## CI / Quality Gates

| Gate | Detail |
|------|--------|
| Trigger | Push to `main` (`.github/workflows/deploy.yml`) |
| Install | `npm ci` |
| Build | `npm run build` — must pass with zero TypeScript errors |
| Deploy | `dist/` → `gh-pages` branch via `JamesIves/github-pages-deploy-action@v4` |
| Node runtime | `ubuntu-latest` (no pinned Node version in workflow) |
<!-- GENERATED:END ci -->

<!-- GENERATED:START architecture -->
## Architecture

| Area | Location | Notes |
|------|----------|-------|
| SRT parse/serialize | `src/utils/srtParser.ts` | Handles BOM, CRLF/LF, block indexing |
| Translation engine | `src/utils/translator.ts` | Google Translate free endpoint; batch delimiter `[xyz999]` |
| RTL detection | `src/utils/rtl.ts` | Hebrew, Arabic, Persian character ranges |
| Theme hook | `src/hooks/useTheme.ts` | Persists to `localStorage`; zero-flash init in `index.html` |
| Design tokens | `src/index.css` | OKLCH CSS variables; mapped in `tailwind.config.cjs` |
| Base path | `vite.config.ts` | `base: '/Universal-Subtitle-Translator/'` |
| UI components | `src/components/` | `DropZone`, `SettingsPanel`, `SubtitleGrid`, `ProgressTracker`, `Downloader`, `Header` |

### Translation pipeline

1. Parse `.srt` → subtitle blocks (`parseSRT`)
2. Bundle pending blocks into character-bounded batches (default chunk size `1500`)
3. Translate batches via worker pool (default concurrency `2`) using `[xyz999]` delimiter
4. On delimiter mismatch or batch failure → binary sub-batch fallback in `translateSubBatches`
5. Serialize translated blocks back to `.srt` for download
<!-- GENERATED:END architecture -->

## Architecture & Codebase Quirks

- **Register:** This is a **product register** interface (utility tool). Keep the layout dense, precise, and highly functional.
- **Base Path & Deployment:** Vite is configured with a base path of `/Universal-Subtitle-Translator/`. Assets and standard routing must resolve relative to this sub-directory path for correct deployment on GitHub Pages.
- **Workflow Automation:** Commits pushed to `main` trigger a GitHub Actions runner (`.github/workflows/deploy.yml`) that compiles the production build and pushes the bundle to the `gh-pages` branch.

---

## Essential Style Rules (Taste System Locks)

- **Subject-Grounded Branding:** The signature accent is a classic on-screen caption gold (`--accent: oklch(0.72 0.14 78)`). Do **not** inject terminal green (`#00ff00`) or generic AI purple/violet gradients.
- **Color Theme Lock:** Native light and dark themes are active via custom `oklch` variables with zero-flash rendering logic in `index.html`.
- **RTL Support:** High-fidelity bidirectional text layout is supported natively on the subtitles grid. The `isRTL` utility detects RTL character sets (Hebrew, Arabic, Persian) and aligns text segments accordingly.
- **Typography & Clean UI:**
  - **No uppercase-mono labels** for headers, inputs, or metadata tags (display fonts in labels are banned).
  - Use system-sans with clean, readable sentence-case formatting.
  - No decorative `animate-bounce` or `animate-pulse` loops.
- **Component States:** Always ensure complete tactile interactive cycles are covered:
  - **Tactile states:** Use `active:scale-[0.98]` on buttons to simulate keypress.
  - **Skeleton states:** Use native skeleton pulses for lazy rendering and pending translations (no infinite loaders or spinners in grid layout).
- **Concurrency & Rate Limits:**
  - Parallel translation runs are configured through a concurrent worker pool (default `2` threads).
  - High concurrency ($>3$ threads) can trigger IP rate-limiting blocks on Google free translate endpoints. Show clear alert states next to the concurrency control if this occurs.
  - Instantly break execution loops on pausing or aborting.
