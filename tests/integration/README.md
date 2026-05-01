# Integration Tests

Integration tests validate cross-service behavior with Docker Compose.

## Run Order
1. Start the stack from the repository root:

	docker compose up --build -d

2. Run the integration tests:

	pytest tests/integration -q

3. Tear down the stack when finished:

	docker compose down

## Test Environment
- `INTEGRATION_BASE_URL` defaults to `http://localhost:8000`
- `INTEGRATION_API_KEY` defaults to `dev-gateway-key`
- `INTEGRATION_AUTH_TOKEN` defaults to `demo-token`

## Covered Checks
- Gateway health endpoint
- Gateway system health contract
- Protected predict-distance requests
- Authenticated gateway flow to upstream services

## Note
These tests are not run in default CI because they require running containers.
