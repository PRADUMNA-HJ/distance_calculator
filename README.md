# Distance Calculator Platform

Production-grade, microservices-based distance estimation platform.

## Product Scope
1. Capture image from mobile camera.
2. Mark object region (box, circle, polygon).
3. Predict object distance from user.
4. Render distance label near object.
5. Feed validated samples back to training pipeline.

The project starts with mobile-first rollout and later adds web using the same APIs.

## Enterprise Architecture Direction
- Centralized API Gateway for all client traffic.
- Independent domain services for annotation, inference orchestration, model serving, dataset ingestion, and auth.
- Contract-first development using OpenAPI.
- Event-driven integration for training data feed.
- CI checks and release workflow for commercial readiness.

See:
- docs/enterprise_architecture.md
- docs/service_catalog.md
- docs/workflow.md

## Team Split
### Member A (Platform + Product)
- Mobile frontend and UX
- API gateway and backend integration
- Dataset submission pipeline integration
- Request/response orchestration
- Annotation and label rendering UX

### Member B (ML + Data)
- Data cleaning and feature engineering
- Model training and evaluation
- Model versioning and artifact publishing
- Inference performance tuning

## Service Layout
- services/api_gateway
- services/auth_service
- services/annotation_service
- services/inference_orchestrator
- services/model_service
- services/dataset_service

## Current Stage
Skeleton services and contracts are in place so both teammates can work in parallel.

## Commercial Readiness Goals
- API versioning and backward compatibility
- Observability: logs, metrics, tracing
- Security: auth, rate limits, secrets handling
- Deployment pipeline with environment separation
- Model governance with artifact metadata and rollback strategy
