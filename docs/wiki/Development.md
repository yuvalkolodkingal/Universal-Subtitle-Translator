# Development

Local setup, scripts, and coding conventions for contributors.

## Prerequisites

- **Node.js** (LTS recommended; CI uses `ubuntu-latest` without a pinned version)
- **npm**

## Setup

```bash
git clone https://github.com/yuvalkolodkingal/Universal-Subtitle-Translator.git
cd Universal-Subtitle-Translator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TypeScript check + production bundle |
| `npm run preview -- --port 4173` | Serve production build locally |

**Always run `npm run build` before committing** — CI runs the same command and must pass with zero TypeScript errors.

## Project layout

```
src/
  main.tsx              Entry
  App.tsx               Orchestrator
  index.css             OKLCH tokens
  components/           UI modules
  hooks/                React hooks
  utils/                SRT + translation + RTL
docs/
  diagrams/             Architecture SVGs
  wiki/                 Wiki source (mirrors GitHub Wiki)
```

## Conventions

### Style and UI

- **Register:** Dense, functional utility-tool layout
- **Accent:** Caption gold `oklch(0.72 0.14 78)` — no terminal green or AI purple gradients
- **Typography:** Sentence-case system sans; no uppercase-mono display labels
- **Buttons:** Include `active:scale-[0.98]` for tactile feedback
- **Loading:** Skeleton pulses in grid; no infinite spinners in the subtitle grid
- **RTL:** Use `isRTL()` for bidirectional text alignment

### Translation engine

- Batch delimiter: ` [xyz999] `
- Default chunk size: 1500 characters
- Default concurrency: 2 (warn users above 3 about rate limits)
- Respect `abortRef` — break loops immediately on pause/abort

### Base path

Vite `base` is `/Universal-Subtitle-Translator/` for GitHub Pages. Asset paths and routing must stay relative to this prefix.

## Agent guidelines

See [`AGENTS.md`](https://github.com/yuvalkolodkingal/Universal-Subtitle-Translator/blob/main/AGENTS.md) in the repo root for architecture notes and CI details used by coding agents.

## Related

- [Deployment](Deployment)
- [Architecture](Architecture)
