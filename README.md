# Universal Subtitle Translator (Web + CLI)

An interactive, production-grade React web application and [OpenCode](https://opencode.ai) skill that translates `.srt` subtitle files between **any language pair** — English to Spanish, Japanese to French, Arabic to Hebrew, and everything in between.

## Live Demo & Web App

You can run this application entirely in your browser. Fully static, client-side, with zero server fees or upload telemetry!

👉 **[Access the Hosted App Live](https://yuvalkolodkingal.github.io/Universal-Subtitle-Translator/)**

### Web Features
- **Interactive File Sandbox** — Drag & drop subtitle `.srt` files and preview parses in real-time.
- **Engine Control Settings** — Adjust target and source languages, batch chunk bundle capacities, and rate limits.
- **Inline Workspace Editor** — Search parsed tracks and manually edit translated lines on-the-fly inside the browser before downloading.
- **Resumable Operations** — Pause, edit, or adjust speed profiles safely without wiping session state.

---

## Direct CLI Usage

You can also run the Python engine script directly.

### CLI Installation

```bash
# 1. Set up a virtual environment
python -m venv .venv
.venv/bin/pip install -r requirements.txt

# 2. Translate
.venv/bin/python scripts/translate.py \
  --input movie.srt \
  --output movie_translated.srt \
  --target spanish
```

### Options

| Flag | Short | Description | Default |
|---|---|---|---|
| `--input` | `-i` | Input `.srt` file | required |
| `--output` | `-o` | Output `.srt` file | required |
| `--target` | `-t` | Target language name or code | required |
| `--source` | `-s` | Source language name or code | `auto` |
| `--progress` | `-p` | Path for the checkpoint file | next to output |

---

## How It Works

Standard `.srt` files can have thousands of subtitle blocks. Translating them individually would be extremely slow and trigger rate limits almost immediately.

Both the React and CLI engine bundle multiple blocks into a single translation request using a `[###]` delimiter, then split the response back into individual blocks. This reduces API calls by ~98% — a 1,500-block file goes from ~1,500 requests to ~30.

If the translation engine alters the delimiter and the response can't be cleanly split, the system automatically falls back to translating that batch block-by-block so nothing is lost.

## License

MIT
