# Agent Guidelines

## Commands

- **Build / Verification:** `npm run build`
  - Runs `tsc && vite build`. Ensure zero TypeScript compiler errors before committing.
- **Local Dev Server:** `npm run dev`
- **Vite Preview (Local Production Server):** `npm run preview -- --port 4173`

---

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
