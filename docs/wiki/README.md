# Wiki source

Markdown pages in this folder mirror the [GitHub Wiki](https://github.com/yuvalkolodkingal/Universal-Subtitle-Translator/wiki).

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

## Sync to GitHub Wiki

Enable Wikis in the repository **Settings → Features**, then:

```bash
git clone https://github.com/yuvalkolodkingal/Universal-Subtitle-Translator.wiki.git
cp docs/wiki/*.md Universal-Subtitle-Translator.wiki/
cd Universal-Subtitle-Translator.wiki
git add -A
git commit -m "Sync wiki from docs/wiki"
git push
```

Until the wiki is enabled, these files are browsable directly on GitHub under `docs/wiki/`.
