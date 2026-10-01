# StitchGrid

A browser-based cross-stitch pattern designer. Upload a photo, lay a numbered
stitch grid over it, fill in colors, and track your progress row by row.
Everything is saved automatically to your browser (no account, no server).

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

Outputs a static site to `dist/`.

## Deploying to Vercel

This is a static Vite app with no backend - it deploys as-is.

> **Note:** this project lives in a subdirectory of its git repo (this
> `StitchGrid/` folder, not the repo root). When importing the repo into
> Vercel, set **Root Directory** to `StitchGrid` in the project's settings
> (or run `vercel --cwd StitchGrid` from the repo root via the CLI).

Once the root directory is set, Vercel auto-detects the Vite framework and
uses the settings in `vercel.json`:

- Build command: `npm run build`
- Output directory: `dist`

No environment variables are required.
