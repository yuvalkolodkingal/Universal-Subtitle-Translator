# Universal Subtitle Translator

An interactive, production-grade React web application that translates `.srt` subtitle files in-browser between **any language pair** — English to Spanish, Japanese to French, Arabic to Hebrew, and everything in between.

## Live Demo & Web App

You can run this application entirely in your browser. Fully static, client-side, with zero server fees or upload telemetry!

👉 **[Access the Hosted App Live](https://yuvalkolodkingal.github.io/Universal-Subtitle-Translator/)**

### Web Features
- **Interactive File Sandbox** — Drag & drop subtitle `.srt` files and preview parses in real-time.
- **Engine Control Settings** — Adjust target and source languages, batch chunk bundle capacities, and rate limits.
- **Inline Workspace Editor** — Search parsed tracks and manually edit translated lines on-the-fly inside the browser before downloading.
- **Resumable Operations** — Pause, edit, or adjust speed profiles safely without wiping session state.

---

## How It Works

Standard `.srt` files can have thousands of subtitle blocks. Translating them individually would be extremely slow and trigger rate limits almost immediately.

The React engine bundles multiple blocks into a single translation request using a `[###]` delimiter, then splits the response back into individual blocks. This reduces API calls by ~98% — a 1,500-block file goes from ~1,500 requests to ~30.

If the translation engine alters the delimiter and the response can't be cleanly split, the system automatically falls back to translating that batch block-by-block so nothing is lost.

## Setup & Local Development

To run this application locally on your computer:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

## License

MIT
