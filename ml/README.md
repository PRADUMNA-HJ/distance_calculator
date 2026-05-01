
# ML Workspace Guidelines

## Owner
Member B handles model training on personal laptop and syncs through GitHub.

## Inputs Expected
- Kaggle dataset baseline
- Mobile camera dataset (< 100 cm)
- Shared schema from shared/schemas/annotation_schema.csv

## Recommended Pipeline
1. Data ingestion and cleaning
2. Region-based feature prep from annotation
3. Baseline model training
4. Validation by distance bands
5. Export model artifact and metadata

## Artifact Contract
Save model cards in ml/artifacts/model_card.json with fields:
- model_name
- model_version
- input_format
- output_format
- train_data_summary
- known_limitations

## Integration Contract
Inference response should always include:
- distance_cm
- confidence
- model_version
- optional label_position

## Recommended Tooling Stack
- Coding assistant: Copilot, Bolt
- Online coding: Replit
- ML and experimentation: Colab
- Full app development: Firebase Studio
- Internet acceleration: WARP
- Voice AI option: ElevenLabs

Python ML libraries for this project:
- numpy for numeric operations
- pandas for data handling
- scikit-learn for baseline models
- tensorflow or pytorch for advanced models later

## Quick Start (Baseline)
1. Install ML dependencies:

	pip install -r ml/requirements.txt

2. Train baseline model from shared annotation schema:

	python ml/train_baseline.py --data-csv shared/schemas/annotation_schema.csv --output-dir ml/artifacts

Validation-first flow (recommended):

	python ml/validate_training_data.py --data-csv shared/schemas/annotation_schema.csv --output-json ml/artifacts/validation_report.json

	python ml/train_baseline.py --data-csv shared/schemas/annotation_schema.csv --output-dir ml/artifacts

3. Validate generated artifacts:
- ml/artifacts/distance_baseline.joblib
- ml/artifacts/metrics.json
- ml/artifacts/model_card.json

4. Optional dataset intake starter:
- ml/templates/training_intake_template.csv
- Copy this template and aggregate your Kaggle, mobile-camera, and mobile-shared rows into one training CSV.

## Notes
- Current baseline trains on annotation geometry fields only.
- As real datasets grow, switch from baseline features to image-based models in tensorflow or pytorch.
- Keep model_card.json updated whenever model_version changes.

## Preferred Workflow (Kaggle + Mobile)
Use the detailed pipeline here:
- docs/ml_data_pipeline_workflow.md
- docs/mobile_labeling_setup_1000.md

Short version:
1. Use Kaggle/public data for scale and diversity.
2. Use 500 to 1000 mobile rows for below-100-cm calibration.
3. Track metrics by source and distance band before model promotion.

Current trainer output includes:
- Overall MAE, RMSE, and R2.
- Validation metrics by source.
- Validation metrics by distance band.

For mobile capture labeling, start from:
- ml/templates/mobile_labeling_template.csv
