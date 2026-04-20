# Backend Code Standards

## File Size Rule
- Target: keep backend files between 50 and 200 lines.
- Hard limit: backend Python files must not exceed 300 lines.
- Exception examples: generated files, migration files, and occasional gateway wiring.

## Structure Rule
Use this pattern per service:
- app/main.py: app bootstrapping only
- app/api/routes.py: endpoint definitions only
- app/schemas.py: request and response models
- app/services/: business logic
- app/core/: config, security, and shared utilities
- app/store.py or repository/: persistence access

## Endpoint Rule
- Endpoints should call service functions, not contain full business logic.
- Keep endpoint functions short and deterministic.

## Debug Rule
- Every service must expose /health.
- Use request id headers for cross-service tracing.

## CI Rule
- scripts/check_backend_file_lines.py enforces line limit in CI.
