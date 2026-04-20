Write-Host "Running backend file size check..."
python scripts/check_backend_file_lines.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$services = @(
    "services/api_gateway",
    "services/auth_service",
    "services/annotation_service",
    "services/inference_orchestrator",
    "services/model_service",
    "services/dataset_service"
)

foreach ($service in $services) {
    Write-Host "Running unit tests for $service ..."
    Push-Location $service
    pip install -r requirements.txt pytest | Out-Null
    pytest tests -q
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        exit $LASTEXITCODE
    }
    Pop-Location
}

Write-Host "Quality gate passed."
