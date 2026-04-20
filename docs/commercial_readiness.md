# Commercial Readiness Checklist

## Security
- Token-based authentication
- Rate limiting at gateway
- Secret management through environment variables or vault
- Input validation on all public endpoints

## Reliability
- Health and readiness probes per service
- Retry and timeout policy for inter-service calls
- Circuit breaker in inference orchestrator

## Observability
- Structured logs with request id
- Error budget and SLO dashboard
- Per-service latency and failure metrics

## Governance
- API versioning policy
- Model card and lineage tracking
- Data privacy and retention policy

## Release
- CI quality gates
- Staging validation before production
- Rollback playbook for model and service releases
