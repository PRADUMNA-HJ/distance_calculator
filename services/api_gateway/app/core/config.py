import os

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
ANNOTATION_SERVICE_URL = os.getenv("ANNOTATION_SERVICE_URL", "http://localhost:8002")
INFERENCE_SERVICE_URL = os.getenv("INFERENCE_SERVICE_URL", "http://localhost:8003")
MODEL_SERVICE_URL = os.getenv("MODEL_SERVICE_URL", "http://localhost:8004")
DATASET_SERVICE_URL = os.getenv("DATASET_SERVICE_URL", "http://localhost:8005")
GATEWAY_API_KEY = os.getenv("GATEWAY_API_KEY", "dev-gateway-key")
