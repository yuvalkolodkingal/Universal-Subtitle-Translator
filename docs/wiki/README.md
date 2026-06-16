# Wiki source

Markdown pages in this folder are the **source of truth** for the [GitHub Wiki](https://github.com/yuvalkolodkingal/Universal-Subtitle-Translator/wiki).

## Automatic sync

The [Sync Wiki](../../.github/workflows/sync-wiki.yml) workflow publishes this folder to the GitHub Wiki on every push to `main` that touches `docs/wiki/**`.

| Setting | Value |
|---------|-------|
| Action | [Andrew-Chen-Wang/github-wiki-action@v5](https://github.com/Andrew-Chen-Wang/github-wiki-action) |
| Source path | `docs/wiki/` |
| Strategy | `init` (deploy-style mirror) |
| Ignored | `README.md` (this file) |

### One-time setup

1. Enable **Wikis** under repository **Settings → Features**
2. Merge a change under `docs/wiki/` to `main`, or run **Actions → Sync Wiki → Run workflow**

Contributors edit wiki pages here and open pull requests — the workflow keeps the GitHub Wiki in sync after merge.

## Pages

| File | Wiki page |
|------|-----------|
| `Home.md` | Home |
| `Architecture.md` | Architecture |
| `Translation-Pipeline.md` | Translation pipeline |
| `Components.md` | Components |
| `Development.md` | Development |
| `Deployment.md` | Deployment |
| `FAQ.md` | FAQ |
| `_Sidebar.md` | Sidebar navigation |
| `_Footer.md` | Footer |

Start reading at [Home.md](Home.md).
