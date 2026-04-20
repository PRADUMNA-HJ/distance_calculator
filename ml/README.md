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
