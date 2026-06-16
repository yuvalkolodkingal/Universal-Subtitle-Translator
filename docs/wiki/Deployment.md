# Deployment

How the app is built and published to GitHub Pages.

## Pipeline

Push to `main` triggers `.github/workflows/deploy.yml`:

1. **Checkout** repository
2. **Install and build:** `npm ci` then `npm run build`
3. **Deploy:** push `dist/` to the `gh-pages` branch via `JamesIves/github-pages-deploy-action@v4`

## Wiki sync

Documentation in `docs/wiki/` is published to the [GitHub Wiki](https://github.com/yuvalkolodkingal/Universal-Subtitle-Translator/wiki) by `.github/workflows/sync-wiki.yml` using [github-wiki-action](https://github.com/Andrew-Chen-Wang/github-wiki-action). The workflow runs on pushes to `main` that change `docs/wiki/**`.

**Prerequisite:** enable **Wikis** under repository **Settings → Features**.

## Live URL

**https://yuvalkolodkingal.github.io/Universal-Subtitle-Translator/**

The Vite base path matches this sub-directory:

```ts
// vite.config.ts
base: '/Universal-Subtitle-Translator/'
```

Without this base path, assets would 404 on GitHub Pages.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Source code; triggers CI |
| `gh-pages` | Deployed static bundle (auto-managed by Actions) |

## Manual preview

To test the production build locally before pushing:

```bash
npm run build
npm run preview -- --port 4173
```

Open [http://localhost:4173/Universal-Subtitle-Translator/](http://localhost:4173/Universal-Subtitle-Translator/).

## CI requirements

- `npm run build` must pass (TypeScript + Vite)
- No pinned Node version in workflow — keep dependencies compatible with current LTS

## Mirror

The repository is mirrored on [Codeberg](https://codeberg.org/YuvalKolodkin/Universal-Subtitle-Translator). GitHub Pages deployment is from GitHub only.

## Related

- [Architecture](Architecture)
- [Development](Development)
