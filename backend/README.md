# Backend (Legacy Monolith Skeleton)

This folder is kept only as a reference from the initial monolith skeleton.

## Active Architecture
Use microservices under services/ with API Gateway as central entrypoint.

## Why Keep This Folder
- Historical reference for first prototype
- Easy comparison between monolith and microservices styles

## Production Path
For enterprise and commercial setup, continue only with:
- services/api_gateway
- services/auth_service
- services/annotation_service
- services/inference_orchestrator
- services/model_service
- services/dataset_service
