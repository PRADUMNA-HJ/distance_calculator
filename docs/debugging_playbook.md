# Debugging Playbook

## Fast Triage Flow
1. Check gateway and target service /health endpoint.
2. Verify request payload against contracts/openapi.yaml.
3. Reproduce with service-level unit test.
4. Reproduce end-to-end with integration test.

## Common Failure Buckets
- Auth header issues
- Contract mismatch
- Service timeout
- Data schema mismatch
- Model version mismatch

## Debugging Best Practices
- Keep one issue per branch.
- Add regression test before fixing bug.
- Include failure and fix notes in pull request.
