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

### GitHub Pages

A GitHub Actions workflow is at `.github/workflows/deploy.yml`. It:
- Triggers on every push to `main`
- Builds from `monster-singularity/` with `VITE_BASE_PATH=/monster-singularity/`
- Deploys to GitHub Pages

To enable:
1. Push the repo to GitHub
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. The workflow runs automatically on the next push

Live URL: `https://<github-username>.github.io/monster-singularity/`

### Vite Base Path

The `vite.config.ts` reads `VITE_BASE_PATH` (defaults to `/`). Set this env var at build time to match your deployment URL prefix:

| Target | `VITE_BASE_PATH` |
|--------|-----------------|
| Netlify | `/` (default) |
| GitHub Pages | `/monster-singularity/` |

## Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **State**: Zustand (persisted to localStorage)
- **Retention server**: Node.js SSE server at `../retention-server/` (optional for dev)

See `../ADR-001-technical-architecture.md` for full architecture decisions.
