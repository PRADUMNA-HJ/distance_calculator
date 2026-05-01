# Services Workspace

Each service is independently deployable and debuggable.

## Services
- api_gateway: public API entrypoint
- auth_service: token validation and identity controls
- annotation_service: annotation persistence
- inference_orchestrator: prediction workflow logic
- model_service: model inference runtime
- dataset_service: dataset ingestion and manifest management

## Local Run
Use docker-compose at repository root to run all services together.

## Unit Testing
Run inside each service folder:
- pip install -r requirements.txt
- pip install -r ../../requirements-dev.txt
- pytest tests -q

## Integration Testing
From repository root:
1. docker compose up --build -d
2. pytest tests/integration -q
3. docker compose down

Integration tests expect the compose stack to be reachable on `http://localhost:8000` and use these defaults when headers are not provided:
- `INTEGRATION_API_KEY=dev-gateway-key`
- `INTEGRATION_AUTH_TOKEN=demo-token`

If the stack is not running, the tests skip with a clear unavailable-stack message.

## Debugging Principle
Always debug at service boundary first:
1. Check service health endpoint.
2. Validate request contract.
3. Trace request id across logs.
4. Reproduce with unit and integration tests before fix.
