# API Usage Notes

Base URL: http://localhost:8000/api

Required headers for protected gateway routes:
- x-api-key: dev-gateway-key
- Authorization: Bearer demo-token

Optional frontend payload fields for richer measurement workflows:
- analysis_mode: distance, depth, area, or size
- target_object_type: car, mountain, box, plot of land, drone target, and similar labels

## 1. Store Training Annotation
Endpoint: POST /v1/annotations (via API Gateway)

Use this when you know the ground-truth distance value.
This is used for model training data feed.

## 2. Predict Distance
Endpoint: POST /v1/predict-distance (via API Gateway)

Use this for user-facing inference in mobile app.
Returns predicted distance and confidence.
For depth, area, or object-size workflows, send analysis_mode and target_object_type along with the annotation payload.

## 3. Register Dataset Ingestion
Endpoint: POST /v1/dataset/ingest

Use this to track Kaggle imports and mobile camera data batches.
The dataset service returns a job id for traceability.

## 4. Label Position Rule
Backend can return label_position to help UI render text near object.
UI should keep text inside image boundaries.

## 5. Mobile Camera Data Feed (< 100 cm)
Recommended flow:
1. Capture photo from app.
2. Mark object region.
3. Enter measured true distance in cm.
4. Send to POST /v1/annotations with source=mobile-camera.
5. Periodically export and sync data for ML training.

## 6. Depth / Area / Object Size Workflows
Recommended flow:
1. Select analysis_mode = depth, area, or size.
2. Enter the object or scene label, such as car, mountain, box, plot of land, or drone target.
3. Mark the object with box, circle, or polygon.
4. Submit the same payload shape through the gateway so the backend can use the extra context when the model support is added.
