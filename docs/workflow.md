# Workflow and Collaboration Plan

Related docs:
- docs/coordination_playbook.md
- CONTRIBUTING.md
- docs/first_collab_day_checklist.md
- docs/branch_naming_map.md

## Branch Strategy
- main: production-ready, protected branch
- develop: integrated pre-release branch
- feature/<service-or-feature>
- hotfix/<critical-fix>
- release/<version>

## Service Ownership (2-Member Team)
### Member A
- api_gateway
- annotation_service integration with mobile
- inference_orchestrator integration
- frontend mobile and web adapter

### Member B
- dataset_service data engineering
- model_service and model training pipeline
- model artifact publication and validation

## Enterprise Delivery Workflow
1. Design or update API contract in contracts/openapi.yaml.
2. Implement changes in one service branch only.
3. Run local tests and static checks.
4. Create pull request to develop.
5. Validate integration in compose environment.
6. Merge to release branch for tagged version.
7. Promote to main after acceptance.

## Pull Request Quality Gate
- API contract updated if endpoint changes.
- Backward compatibility reviewed.
- Unit/integration tests added.
- Security checks pass (secret scan, dependency scan).
- Observability hooks included (logs and metrics).
- Model card updated if model version changed.
- Backend file size standards pass (docs/backend_code_standards.md).
- Testing strategy followed (docs/testing_strategy.md).
- Debugging runbook updated if new failure mode found (docs/debugging_playbook.md).

## Debugging Strategy
- One request id across gateway and all services.
- Reproduce failures in isolated service containers.
- Contract tests run before merge.

## Milestones
1. Microservices skeleton and gateway routing complete
2. End-to-end predict flow with mock model complete
3. Real model integration complete
4. Mobile beta with telemetry complete
5. Hardening for commercial demo complete
