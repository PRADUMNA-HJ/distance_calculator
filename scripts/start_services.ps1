$pythonPath = "c:/Users/Hp/Desktop/distance_calculator/.venv/Scripts/python.exe"
$baseDir = "c:/Users/Hp/Desktop/distance_calculator"

$env:AUTH_BEARER_TOKEN = "demo-token"
Start-Process -FilePath $pythonPath -ArgumentList "-m", "uvicorn", "app.main:app", "--port", "8001" -WorkingDirectory "$baseDir/services/auth_service"

$env:DATABASE_PATH = "$baseDir/data/annotation_service.db"
Start-Process -FilePath $pythonPath -ArgumentList "-m", "uvicorn", "app.main:app", "--port", "8002" -WorkingDirectory "$baseDir/services/annotation_service"

$env:MODEL_SERVICE_URL = "http://localhost:8004"
Start-Process -FilePath $pythonPath -ArgumentList "-m", "uvicorn", "app.main:app", "--port", "8003" -WorkingDirectory "$baseDir/services/inference_orchestrator"

Start-Process -FilePath $pythonPath -ArgumentList "-m", "uvicorn", "app.main:app", "--port", "8004" -WorkingDirectory "$baseDir/services/model_service"

$env:DATABASE_PATH = "$baseDir/data/dataset_service.db"
Start-Process -FilePath $pythonPath -ArgumentList "-m", "uvicorn", "app.main:app", "--port", "8005" -WorkingDirectory "$baseDir/services/dataset_service"

$env:AUTH_SERVICE_URL = "http://localhost:8001"
$env:ANNOTATION_SERVICE_URL = "http://localhost:8002"
$env:INFERENCE_SERVICE_URL = "http://localhost:8003"
$env:MODEL_SERVICE_URL = "http://localhost:8004"
$env:DATASET_SERVICE_URL = "http://localhost:8005"
$env:GATEWAY_API_KEY = "dev-gateway-key"
$env:UPLOAD_DIR = "$baseDir/data/uploads"

Start-Process -FilePath $pythonPath -ArgumentList "-m", "uvicorn", "app.main:app", "--port", "8000" -WorkingDirectory "$baseDir/services/api_gateway"

Write-Output "All services started."