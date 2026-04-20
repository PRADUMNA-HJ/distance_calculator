# Service Catalog

## api_gateway
- Role: single entrypoint
- Responsibilities: auth check, route management, request id propagation
- External port: 8000

## auth_service
- Role: token validation and identity
- Responsibilities: issue/verify tokens, basic role checks
- Internal port: 8001

## annotation_service
- Role: annotation and label persistence
- Responsibilities: save and retrieve training labels
- Internal port: 8002

## inference_orchestrator
- Role: prediction business workflow
- Responsibilities: call model service, apply confidence policy, compute label position
- Internal port: 8003

## model_service
- Role: model inference runtime
- Responsibilities: load active model and return prediction
- Internal port: 8004

## dataset_service
- Role: dataset ingestion and versioning
- Responsibilities: merge Kaggle and mobile data, build manifests
- Internal port: 8005
