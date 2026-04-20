# Deployment Workflow

## Environments
- local: docker-compose for development
- staging: integration and QA
- production: commercial release

## Promotion Flow
1. Merge feature branches into develop.
2. Deploy develop to staging.
3. Execute integration and model validation checks.
4. Create release branch and tag version.
5. Deploy tagged release to production.

## Release Artifacts
- API contract version
- Service image tags
- Model artifact version
- Migration notes

## Rollback Strategy
- Rollback gateway route to previous service version.
- Rollback model_service to previous model_version.
- Keep database migration scripts reversible.
