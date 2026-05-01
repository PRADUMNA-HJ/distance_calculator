# Mobile App (Primary Product)

This prototype now mirrors the futuristic website UI so the mobile product matches the same dark cyber, glassmorphism, sci-fi measurement style.

Open the prototype here:
- [mobile/prototype/index.html](mobile/prototype/index.html)

## Scope in Phase 1
- Camera capture / gallery upload
- Annotation interaction (box/circle/polygon)
- Call POST /v1/predict-distance
- Render distance label near object
- Optional mode: capture true distance and send POST /v1/annotations

## UI Recommendation for Annotation
- Tap and drag for box
- Circle mode for rounded objects
- Polygon mode for irregular objects

## Distance Label Rendering Rules
1. Prefer top of object if space is available.
2. If overflow, place at side with connector line.
3. Clamp label coordinates inside image canvas.

## Suggested Screen Flow
1. CameraScreen
2. MarkObjectScreen
3. PredictionResultScreen
4. DataCaptureScreen (for training labels)

## Visual Direction
- Dark modern cyber aesthetic
- Glassmorphism cards with neon accents
- HUD-style reticles and scan lines
- Premium mobile-first hero, demo, docs, and CTA sections

## Prototype Added (April 2026)
- A lightweight clickable mobile flow prototype is available in `mobile/prototype/index.html`.
- It simulates Camera -> Mark -> Result screens and tool switching (box/circle/polygon).
- This is intended for UI validation before full native implementation.
