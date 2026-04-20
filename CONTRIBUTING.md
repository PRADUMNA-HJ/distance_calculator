# Contributing Guide

## Collaboration Model
This project is developed by 2 members with microservice ownership.

## Branch Rules
- Never push directly to main.
- Work on feature branches only.
- Naming:
  - feature/<service>-<short-task>
  - fix/<service>-<short-task>
  - hotfix/<critical-task>

## Recommended Ownership
- Member A: api_gateway, annotation_service integration, frontend integration
- Member B: dataset_service and model_service training/inference
- Shared: inference_orchestrator, contracts, architecture docs

## Pull Request Rules
- One PR = one focused change.
- Keep PR under ~400 changed lines where possible.
- Include test evidence and screenshots/logs for behavior changes.
- Update docs when API/schema/workflow changes.

## Mandatory PR Checklist
- [ ] Unit tests added or updated
- [ ] Integration impact reviewed
- [ ] API contract reviewed (contracts/openapi.yaml)
- [ ] No secrets committed
- [ ] Backend file size limit check passes

## Conflict Handling
- Rebase feature branch on develop before opening PR.
- If conflict is in contract/schema files, resolve together in a quick call.
- Use comments on PR for final decision history.

## Daily Cadence
- 10-minute daily sync:
  1. Yesterday done
  2. Today plan
  3. Blockers
- End each day by pushing branch and updating issue status.
