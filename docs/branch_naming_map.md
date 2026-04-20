# Branch Naming Map (Strict)

Use this naming system exactly to keep collaboration smooth.

## Base Branches
- main: production-ready code only
- develop: integration branch for ongoing work

## Personal Prefix Rule
- Your branches start with: p1/
- Friend branches start with: p2/

## Branch Format
pX/<area>/<ticket-or-task>-<short-description>

Examples:
- p1/frontend/fe-001-image-marking-ui
- p1/api/gw-002-auth-header-fix
- p2/ml/ml-001-baseline-training
- p2/data/data-003-mobile-ingestion-script

## Allowed Areas
- frontend
- api
- annotation
- inference
- model
- data
- docs
- ci
- refactor
- hotfix

## Ready-to-Copy Branch Names
### Your Side (Member A)
- p1/frontend/fe-001-web-canvas-skeleton
- p1/api/gw-001-gateway-request-id-propagation
- p1/annotation/ann-001-annotation-storage-db
- p1/inference/inf-001-label-placement-policy
- p1/docs/doc-001-api-and-ux-updates

### Friend Side (Member B)
- p2/model/ml-001-baseline-model-service
- p2/model/ml-002-model-versioning-support
- p2/data/data-001-kaggle-dataset-ingestion
- p2/data/data-002-mobile-short-range-pipeline
- p2/inference/inf-002-model-response-calibration

## Pull Request Title Convention
[AREA] <ticket>: <short summary>

Examples:
- [API] GW-002: add token verification retry policy
- [MODEL] ML-001: add baseline predictor contract response

## Merge Rules
1. Feature branches must target develop.
2. Only release branch can merge to main.
3. Hotfix branch can merge to main and then back-merge to develop.

## Rebase Rule
Before opening PR:
1. Pull latest develop.
2. Rebase your branch on develop.
3. Resolve conflicts locally.
4. Push with --force-with-lease.

## Emergency Rule
If both members need same file:
1. Create a short coordination branch for pair fix.
2. Keep scope minimal.
3. Merge quickly to develop.

## Branch Lifetime Rule
- Create branch when task starts.
- Delete branch after merge.
- Never reuse old feature branch for a new task.
