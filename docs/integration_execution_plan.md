# Integration Execution Plan (Frontend + Backend + Microservices)

Scope owner: Platform/Product integration teammate

## Your Core Responsibilities
- Frontend integration with API Gateway
- API request contracts and response rendering
- Gateway routing validation across services
- Service-level persistence checks (annotation and dataset)
- API key and auth token usage in all protected calls
- End-to-end request id traceability

## What Is Already Implemented
- Gateway now requires `x-api-key` and `Authorization: Bearer <token>`.
- Auth service supports strict token check using `AUTH_BEARER_TOKEN`.
- Annotation service writes records to SQLite (`DATABASE_PATH`).
- Dataset service writes ingest jobs to SQLite (`DATABASE_PATH`).
- Frontend has configurable Gateway URL, API key, and token inputs.

## Daily Run Sequence
1. Start microservices:

   docker compose up --build

2. Open frontend:
- web/frontend/html/index.html

3. In UI config fields use:
- Gateway URL: http://localhost:8000
- API Key: dev-gateway-key
- Bearer Token: demo-token

4. Trigger prediction call from the UI and validate response text.

5. Test annotation ingestion from gateway:

   curl -X POST http://localhost:8000/api/v1/annotations \
     -H "Content-Type: application/json" \
     -H "x-api-key: dev-gateway-key" \
     -H "Authorization: Bearer demo-token" \
     -d "{\"image_id\":\"img-1\",\"image_uri\":\"images/img-1.jpg\",\"mark_type\":\"box\",\"true_distance_cm\":85,\"source\":\"mobile-camera\"}"

6. Verify DB files are being updated:
- data/annotation_service.db
- data/dataset_service.db

## Integration Rules
- Never call internal services directly from frontend; use only gateway.
- Always include x-request-id for manual API testing when debugging.
- Keep contracts backward compatible when changing payloads.
- Add or update docs/api_usage.md when endpoint behavior changes.

## Handoff Rule With ML Teammate
- You own API/output compatibility.
- ML teammate owns model quality and training artifacts.
- Keep model response contract stable:
  - distance_cm
  - confidence
  - model_version
  - optional label_position
