# Prompt To UI Mapping

This file shows where the UI/UX prompt is used in the frontend.

## Hero / Cinematic Landing
- File: `src/App.tsx`
- Used for the main visual statement:
  - "Measure the Real World with AI Precision"
  - premium CTA buttons
  - floating hero cards
  - shader background

## Premium Navigation
- File: `src/components/ui/floating-nav.tsx`
- Used for the transparent floating navbar with Home, Demo, Features, Docs, Launch App.

## Feature Cards, Stats, Timeline, Use Cases, CTA
- File: `src/components/ui/landing-sections.tsx`
- Used for:
  - Camera Capture
  - Draw & Mark Objects
  - AI Distance Estimation
  - Real Time Detection
  - How It Works timeline
  - AI accuracy stats
  - use case cards
  - final CTA

## Main Product Demo / Graphics
- File: `src/components/ui/ui-shell.tsx`
- Used for:
  - camera viewport mock
  - image upload area
  - draw mode buttons
  - bounding box and distance label visuals
  - AI side panel
  - label above / side mockups

## Backend Action Buttons / Real Interactions
- File: `src/components/ui/backend-console.tsx`
- Used for:
  - health check button
  - predict distance button
  - save annotation button
  - ingest dataset button
  - upload / camera image picker

## Shader / Futuristic Visual Effect
- File: `src/components/ui/shader-background.tsx`
- Used for the moving grid and plasma style background layer.

## Entry Point
- File: `src/App.tsx`
- This is where all of the above pieces are assembled into the full landing page.
