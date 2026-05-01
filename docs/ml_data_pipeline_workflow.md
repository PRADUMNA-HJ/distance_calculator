# ML Data Pipeline Workflow

This workflow is designed for the distance model strategy discussed for this project:
- Use Kaggle and other public data for scale.
- Use mobile camera data for real-world calibration.
- Keep strong focus on the below-100-cm range.

## 1. Data Sources and Targets

### Source mix for first production baseline
- `kaggle`: 70 to 85 percent of total rows.
- `mobile-camera`: 10 to 25 percent of total rows.
- `mobile-shared`: 0 to 10 percent, kept as a separate quality bucket.

### Recommended initial volume
- Total training rows: 3000 to 8000.
- Mobile rows: 500 to 1000.
- Public rows: remaining rows.

## 2. Distance-Band Policy

All data should be assigned to one distance band:
- `0_20_cm`
- `20_40_cm`
- `40_60_cm`
- `60_80_cm`
- `80_100_cm`
- `100_300_cm`
- `300_plus_cm`

For below-100-cm, keep counts as balanced as possible across the first five bands.

## 3. Mobile Collection Plan (1000-photo target)

Use this as a practical collection target for mobile data:
- 0 to 20 cm: 200 rows
- 20 to 40 cm: 200 rows
- 40 to 60 cm: 200 rows
- 60 to 80 cm: 200 rows
- 80 to 100 cm: 200 rows

For each band, try to vary:
- Indoor and outdoor scenes.
- Morning, daylight, and night lighting.
- At least 5 object categories.

## 4. Data Quality Rules

Required per row:
- Image URI/path
- Annotation geometry
- `true_distance_cm`
- `source`
- `source_quality`

`source` allowed values:
- `kaggle`
- `mobile-camera`
- `mobile-shared`

`source_quality` allowed values:
- `original`
- `compressed`
- `blurry`
- `low-light`

Rules:
- Prefer original images over compressed shares.
- If image came from WhatsApp or similar tools, mark it as `compressed`.
- Do not mix unknown-quality rows into training without tagging.

## 5. Unified Training Dataset

Prepare one CSV aligned with the schema in shared/schemas/annotation_schema.csv and include these extra columns when available:
- `source_quality`
- `distance_band`
- `device_id`

Keep a reproducible snapshot for each training run:
- `ml/artifacts/datasets/train_dataset_<version>.csv`

## 6. Training Workflow

1. Run data validation and cleaning.
   - `python ml/validate_training_data.py --data-csv <train_csv_path> --output-json ml/artifacts/validation_report.json`
2. Build the training CSV snapshot.
3. Train baseline model:
   - `python ml/train_baseline.py --data-csv <train_csv_path> --output-dir ml/artifacts`
4. Save and review artifacts:
   - `ml/artifacts/distance_baseline.joblib`
   - `ml/artifacts/metrics.json`
   - `ml/artifacts/model_card.json`
5. Compare against previous run before promotion.

## 7. Evaluation Workflow

Always report metrics at three levels:
- Overall
- By source (`kaggle`, `mobile-camera`, `mobile-shared`)
- By distance band

Core metrics:
- MAE (cm)
- RMSE (cm)
- R2

## 8. Promotion Gates

Do not promote a model unless all are true:
- Overall MAE is better than previous stable model.
- Below-100-cm MAE does not regress.
- `mobile-camera` MAE does not regress.
- Model card is updated with dataset summary and limitations.

## 9. Retraining Triggers

Trigger retraining when any condition is met:
- New labeled rows increased by 20 percent or more.
- Mobile-camera data increased by 200 or more rows.
- Production monitoring shows sustained error drift.
- Monthly scheduled refresh.

## 10. Recommended Weekly Cadence

1. Collect and label new rows daily.
2. Run validation and aggregation weekly.
3. Run training and evaluation weekly.
4. Promote model only if gates pass.

## 11. Future Upgrade Path

Current baseline is geometry-driven. Keep this baseline as a fallback while preparing image-based models.

Planned upgrade path:
- Phase 1: Geometry model hardening (current)
- Phase 2: Add image + geometry model experiments
- Phase 3: Deploy best model with rollback to baseline
