# Architecture

This page describes the system design: what runs where, and how source files connect.

## Tech stack

Client-side SPA: React and TypeScript bundled with Vite, styled with Tailwind and OKLCH tokens. Translation runs in the browser via batched calls to Google Translate. GitHub Actions builds and deploys to GitHub Pages.

![Tech stack diagram](https://raw.githubusercontent.com/yuvalkolodkingal/Universal-Subtitle-Translator/main/docs/diagrams/tech-stack.svg)

### Layers

| Layer | Technology | Role |
|-------|------------|------|
| **Client browser** | React 18 SPA | UI, state, worker pool orchestration |
| **Frontend stack** | TypeScript, Vite, Tailwind, OKLCH tokens, Inter, lucide-react | Build, styling, icons |
| **Application core** | `srtParser.ts`, `translator.ts`, `rtl.ts` | Parse/serialize SRT, batch translate, RTL layout |
| **External API** | Google Translate (`translate.googleapis.com`) | Machine translation |
| **CI and hosting** | GitHub Actions, gh-pages branch | Build and static deploy |

## Code structure

`App.tsx` is the orchestrator: it holds translation state, batches pending blocks, and drives the concurrent worker pool.

![Code structure diagram](https://raw.githubusercontent.com/yuvalkolodkingal/Universal-Subtitle-Translator/main/docs/diagrams/code-structure.svg)

### Module map

```
index.html
  └── main.tsx
        ├── index.css          (OKLCH design tokens)
        └── App.tsx
              ├── components/  (UI)
              ├── utils/       (SRT + translation)
              └── hooks/       (theme)
```

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Main state, batching, worker pool, layout |
| `src/utils/srtParser.ts` | `parseSRT`, `stringifySRT` |
| `src/utils/translator.ts` | `translateBatch`, language list, retries |
| `src/utils/rtl.ts` | `isRTL` for Hebrew, Arabic, Persian |
| `src/hooks/useTheme.ts` | Light/dark theme with `localStorage` |
| `vite.config.ts` | Base path `/Universal-Subtitle-Translator/` |
| `.github/workflows/deploy.yml` | Build on push to `main`, deploy `dist/` |

## Design tokens

The signature accent is caption gold: `--accent: oklch(0.72 0.14 78)`. Light and dark themes use OKLCH variables in `src/index.css`, with zero-flash init in `index.html`.

## Related

- [Translation pipeline](Translation-Pipeline)
- [Components](Components)
- [Deployment](Deployment)
