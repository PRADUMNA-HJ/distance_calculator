# Enterprise Microservices Blueprint

## Centralized API Pattern
All external clients access only API Gateway.
No client calls internal services directly.

## Domains and Bounded Contexts
- Identity and access: auth_service
- Annotation lifecycle: annotation_service
- Prediction orchestration: inference_orchestrator
- Model execution: model_service
- Data ingestion and manifests: dataset_service

## Integration Style
- Synchronous HTTP for request/response user actions
- Asynchronous events for dataset ingestion and retraining triggers

## Commercial Readiness Controls
- Versioned APIs
- SLA-driven service metrics
- Structured logging and tracing
- Environment promotion strategy (dev/stage/prod)
- Disaster recovery and model rollback plan
