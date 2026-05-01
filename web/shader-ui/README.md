# Shader UI Integration

This folder contains a React + TypeScript + Tailwind + shadcn-compatible integration for the shader background component.

## What Was Added
- `src/components/ui/shader-background.tsx`
- `src/components/ui/demo.tsx`
- `src/components/ui/floating-nav.tsx`
- `src/components/ui/landing-sections.tsx`
- `src/components/ui/ui-shell.tsx`
- Tailwind setup (`tailwind.config.ts`, `postcss.config.js`, `src/index.css`)
- shadcn config (`components.json`)
- TypeScript + Vite config
- Futuristic landing sections for hero, features, demo, stats, use cases, and CTA
- Interface blocks for image upload, draw modes, and label placement above/side of image
- Backend control panel with live buttons for health check, prediction, annotation save, and dataset ingest
- Browser-side file picker and camera capture preview with URI-based backend submission
- Multipart upload path for prediction calls through `/api/v1/predict-distance/upload`
- Prompt-to-UI map: `PROMPT_TO_UI.md`

## Default Paths
- Components: `src/components`
- UI components: `src/components/ui`
- Global styles: `src/index.css`

Why `src/components/ui` matters:
- shadcn generators and aliases assume a consistent ui component location.
- It keeps generated and custom UI primitives discoverable.
- It avoids alias/import drift across contributors and CI.

## Run Locally
1. Install dependencies

   npm install

2. Start dev server

   npm run dev

3. Build production

   npm run build

Note: the current workspace environment does not expose `npm`, so you will need Node.js installed locally to run the commands above.

## If You Prefer shadcn CLI Initialization
If your project has not been initialized with shadcn yet:

1. Create React TypeScript app

   npm create vite@latest shader-ui -- --template react-ts

2. Install Tailwind

   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p

3. Initialize shadcn

   npx shadcn@latest init

4. Add components

   npx shadcn@latest add button

## Integration Questions to Confirm
- What props should the shader accept (speed, colors, intensity, z-index)?
- Should the animation pause on low-power mode or when tab is hidden?
- Is this global background for all screens or only hero/splash screens?
- Do we need mobile-specific performance caps (lower linesPerGroup, lower pixel ratio)?
- Should this be theme-aware (light/dark palettes)?
- Should the backend panel also support real image uploads, or is image URI enough for now?
