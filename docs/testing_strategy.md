# Testing Strategy (Enterprise)

## Test Pyramid
- Unit tests: service logic and endpoints in isolation
- Integration tests: gateway and service interaction
- Contract tests: OpenAPI compatibility and payload schema checks
- Smoke tests: health checks after deployment

## Mandatory Checks per PR
- Unit tests for changed service
- Backend line-size check
- API contract file presence and compatibility review

## Test Ownership
- Member A: gateway, annotation flow, frontend integration tests
- Member B: dataset and model behavior tests

## Coverage Goal
- Start at 60 percent and increase progressively as features stabilize.
