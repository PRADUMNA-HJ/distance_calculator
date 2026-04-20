# Integration Tests

Integration tests validate cross-service behavior with Docker Compose.

## Run Order
1. Start stack: docker compose up --build -d
2. Run integration tests from repo root.
3. Tear down stack: docker compose down

## Note
These tests are not run in default CI because they require running containers.
