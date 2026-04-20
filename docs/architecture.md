# Architecture (Enterprise Microservices)

## Core Principle
All clients talk only to API Gateway. Gateway routes to internal services.

## Services
1. API Gateway
- Centralized entrypoint for mobile and web
- Request validation, auth enforcement, rate limit, request id
- Routes to internal services

2. Auth Service
- Token issuance and verification
- Role and permission model for admin and user actions

3. Annotation Service
- Stores object marks and training labels
- Handles image metadata and annotation audit trail

4. Inference Orchestrator
- Accepts prediction requests
- Calls model service
- Applies business logic, confidence thresholds, label placement

5. Model Service
- Loads active model artifact
- Performs inference and returns raw prediction

6. Dataset Service
- Ingests Kaggle and mobile short-range samples
- Maintains dataset versions and export manifests for training

## Runtime Request Flow (Prediction)
1. Mobile uploads or references image and mark region.
2. Gateway validates token and payload.
3. Gateway forwards to Inference Orchestrator.
4. Orchestrator calls Model Service.
5. Orchestrator computes label position and confidence policy.
6. Gateway returns final response to mobile.
7. Mobile renders distance label near object.

## Runtime Request Flow (Training Data Feed)
1. App captures short-range sample with true_distance_cm.
2. Gateway forwards annotation payload to Annotation Service.
3. Annotation Service emits ingestion event.
4. Dataset Service consumes and builds training manifest.
5. ML training pipeline consumes manifest and produces model artifact.

## Data Stores
- Postgres: annotations, metadata, model registry pointers
- Object storage: images and model artifacts
- Message broker: async ingestion and retraining triggers

## Observability and Debugging
- Correlation id propagated across all services.
- Centralized logs with service name and trace id.
- Metrics per service: latency, error rate, throughput.
- Health and readiness endpoint per service.

## Codebase Maintainability Rule
- Keep backend microservice files small and focused.
- Preferred range: 50-200 lines per Python file.
- Hard limit: 300 lines, enforced in CI.
- See docs/backend_code_standards.md.

## Deployment Recommendation
- Local: Docker Compose
- Staging/Production: Kubernetes
- CI/CD: GitHub Actions with per-service build and test

## Why This Is Commercially Strong
- Independent service scaling and debugging
- Contract-driven integration
- Security and audit controls
- Gradual rollout and rollback per service
