$ErrorActionPreference = "Stop"
$pythonPath = "c:\Users\Hp\Desktop\distance_calculator\.venv\Scripts\python.exe"
$baseDir = "c:\Users\Hp\Desktop\distance_calculator"

$env:AUTH_BEARER_TOKEN = "demo-token"
$j1 = Start-Job -ScriptBlock { Set-Location $args[1]; & $args[0] -m uvicorn app.main:app --port 8001 } -ArgumentList $pythonPath, "$baseDir\services\auth_service"

$env:DATABASE_PATH = "$baseDir\data\annotation_service.db"
$j2 = Start-Job -ScriptBlock { Set-Location $args[1]; & $args[0] -m uvicorn app.main:app --port 8002 } -ArgumentList $pythonPath, "$baseDir\services\annotation_service"

$env:MODEL_SERVICE_URL = "http://localhost:8004"
$j3 = Start-Job -ScriptBlock { Set-Location $args[1]; & $args[0] -m uvicorn app.main:app --port 8003 } -ArgumentList $pythonPath, "$baseDir\services\inference_orchestrator"

$j4 = Start-Job -ScriptBlock { Set-Location $args[1]; & $args[0] -m uvicorn app.main:app --port 8004 } -ArgumentList $pythonPath, "$baseDir\services\model_service"

$env:DATABASE_PATH = "$baseDir\data\dataset_service.db"
$j5 = Start-Job -ScriptBlock { Set-Location $args[1]; & $args[0] -m uvicorn app.main:app --port 8005 } -ArgumentList $pythonPath, "$baseDir\services\dataset_service"

$env:AUTH_SERVICE_URL = "http://localhost:8001"
$env:ANNOTATION_SERVICE_URL = "http://localhost:8002"
$env:INFERENCE_SERVICE_URL = "http://localhost:8003"
$env:MODEL_SERVICE_URL = "http://localhost:8004"
$env:DATASET_SERVICE_URL = "http://localhost:8005"
$env:GATEWAY_API_KEY = "dev-gateway-key"
$env:UPLOAD_DIR = "$baseDir\data\uploads"
$j6 = Start-Job -ScriptBlock { Set-Location $args[1]; & $args[0] -m uvicorn app.main:app --port 8000 } -ArgumentList $pythonPath, "$baseDir\services\api_gateway"

Start-Sleep -Seconds 7
& $pythonPath -m pytest -v tests\integration\
$res = $LASTEXITCODE

$j1, $j2, $j3, $j4, $j5, $j6 | Stop-Job
$j1, $j2, $j3, $j4, $j5, $j6 | Remove-Job
exit $res
