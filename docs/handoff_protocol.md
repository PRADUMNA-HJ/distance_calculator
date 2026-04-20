# Handoff Protocol (Between App/API and ML)

## ML to App/API Handoff
For every model update, include:
1. model artifact path
2. model version
3. expected input format
4. expected output format
5. confidence interpretation
6. known failure cases
7. target service endpoint contract compatibility

## App/API to ML Handoff
For data updates, include:
1. annotation schema version
2. sample payload JSON
3. edge cases from UI annotation
4. device camera metadata if available

## Service-to-Service Contract Rule
- API Gateway is the only public entrypoint.
- Internal service APIs can change only with semantic versioning notes.
- Breaking changes require major version increment and migration notes.

## Versioning Rule
- API and model versions should be explicitly linked in release notes.
