# Team Coordination Playbook

## 1. GitHub Setup
1. Create GitHub repository (if not already).
2. Add your friend as collaborator with write access.
3. Protect main branch:
   - Require pull request before merge
   - Require at least 1 approval
   - Require status checks (CI)
4. Use develop as integration branch.

## 2. Working Agreement
- No direct commit to main.
- Create issue before major change.
- Link each PR to an issue.
- Merge only after CI passes.
- Follow strict branch naming map in docs/branch_naming_map.md.

## 3. Task Split (Current)
- You:
  - frontend module
  - api_gateway
  - annotation flow integration
- Friend:
  - dataset pipeline
  - model_service logic
  - model artifact/version updates
- Joint:
  - inference_orchestrator
  - contract changes

## 4. Weekly Rhythm
- Monday: plan sprint and assign issues.
- Daily: short sync call or message update.
- Friday: integration test run and demo.

## 5. Done Criteria (per task)
- Code merged via PR.
- Unit tests pass.
- If cross-service change, integration test passes.
- Docs updated.

## 6. Communication Templates
### Daily Update Template
- Done:
- Next:
- Blocker:

### PR Description Template
- Scope:
- Services touched:
- Test proof:
- Rollback note:

## 7. High-Risk Files Requiring Joint Review
- contracts/openapi.yaml
- shared/schemas/annotation_schema.csv
- docker-compose.yml
- docs/architecture.md

## 8. Integration Day Checklist
1. Pull latest develop.
2. Run local quality gate script.
3. Start compose stack.
4. Run integration smoke tests.
5. Document failures and assign owner.
