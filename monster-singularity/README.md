# Monster Singularity

An idle/incremental mobile game with 10,000+ monster species and 3-year real-time progression.

## Development

```bash
npm install
npm run dev        # Vite dev server only
npm run dev:full   # Vite + retention server (requires ../retention-server/server.js)
npm run build      # TypeScript check + production build
npm run preview    # Preview production build locally
```

## Deployment

### Netlify (primary)

The repo root contains `netlify.toml` which configures Netlify to build from the `monster-singularity/` subdirectory. To deploy:

1. Connect the GitHub repo to Netlify at [app.netlify.com](https://app.netlify.com)
2. Netlify auto-detects `netlify.toml` — no manual config needed
3. Every push to `main` triggers a new deploy

Manual deploy via CLI:
```bash
cd monster-singularity
npm install
NETLIFY_AUTH_TOKEN=<token> npx netlify-cli deploy --dir=dist --prod
```

### GitHub Pages (active)

**Live URL: https://2fast2hunter-ai.github.io/monster-singularity/**

Deployment uses the `gh-pages` branch. To redeploy:

```bash
cd monster-singularity
npm run build          # .env.production sets VITE_BASE_PATH=/monster-singularity/
git worktree add /tmp/ghpages gh-pages
cp -r dist/. /tmp/ghpages/
cd /tmp/ghpages && git add -A && git commit -m "Deploy" && git push
git worktree remove /tmp/ghpages
```

A GitHub Actions workflow also exists at `.github/workflows/deploy.yml` for CI-based deploys (requires Pages source set to "GitHub Actions" in repo settings).

### Vite Base Path

The `vite.config.ts` uses `loadEnv` to read `VITE_BASE_PATH` (defaults to `/`). The `.env.production` file sets the correct value for GitHub Pages builds:

| Target | `VITE_BASE_PATH` |
|--------|-----------------|
| Local dev / Netlify | `/` (default) |
| GitHub Pages | `/monster-singularity/` (set in `.env.production`) |

## Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **State**: Zustand (persisted to localStorage)
- **Retention server**: Node.js SSE server at `../retention-server/` (optional for dev)

See `../ADR-001-technical-architecture.md` for full architecture decisions.
