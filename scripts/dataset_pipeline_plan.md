# Dataset Pipeline Plan

## Kaggle Baseline
1. Download selected distance-related datasets.
2. Map source labels to shared schema.
3. Normalize units to cm.

## Mobile Short-Range Data
1. Capture controlled photos at multiple angles.
2. Include lighting variation and object diversity.
3. Focus heavily on 20-100 cm for accuracy.

## Merge Strategy
- Keep a source column: kaggle or mobile-camera
- Split train/validation by scene, not by random frame only
- Track versioned manifest for reproducibility

## Output Needed by ML
- images index file
- annotations file
- train/val split files

## Validation and Testing Checkpoints
1. Schema validation test: every record matches shared schema.
2. Unit consistency test: distance values must be in cm.
3. Range sanity test: flag extreme outliers.
4. Split quality test: avoid leakage across train/val.
5. Ingestion contract test: dataset_service accepts payload version.

## Debug Checklist for Data Issues
- Missing image path
- Invalid mark_type
- Negative or zero distance
- Corrupt annotation geometry
- Mismatched dataset version tags
