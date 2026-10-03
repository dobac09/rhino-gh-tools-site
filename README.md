# rhino-gh-tools introduction website

**Many problems, Many solutions.**

An evolving collection of ideas for modeling and drafting. Currently at the concept stage.

This repository contains only the public introduction website, with oversized typography and a Three.js background. The main project repository remains private.

## Local development

Requires Node.js 22.12+ (or 20.19+).

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Local path: `/rhino-gh-tools-site/`.

## GitHub Pages

Select **Settings → Pages → Source: GitHub Actions**. The included workflow deploys the static `dist` output on pushes to `main`.

Expected URL after deployment: https://dobac09.github.io/rhino-gh-tools-site/

Reduced-motion preferences, a pause control, and a static no-WebGL fallback are supported.
