# AgriAI - PowerShell All Services Starter
Write-Host "========================================================" -ForegroundColor Green
Write-Host "       AgriAI - Starting All Services" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Backend (FastAPI on Port 8000)
$backendPort = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($backendPort) {
    Write-Host "[Backend] Port 8000 is already active." -ForegroundColor Cyan
} else {
    Write-Host "[Backend] Launching FastAPI backend on http://localhost:8000..." -ForegroundColor Yellow
    Start-Process cmd.exe -ArgumentList "/k cd /d `"$rootDir\agri-ai\backend`" && .\.venv311\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
}

# 2. Frontend (React + Vite on Port 5173)
$frontendPort = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontendPort) {
    Write-Host "[Frontend] Port 5173 is already active." -ForegroundColor Cyan
} else {
    Write-Host "[Frontend] Launching Vite frontend on http://localhost:5173..." -ForegroundColor Yellow
    Start-Process cmd.exe -ArgumentList "/k cd /d `"$rootDir\agri-ai\frontend`" && npm run dev"
}

# 3. Mobile (Expo on Port 8081)
$mobilePort = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($mobilePort) {
    Write-Host "[Mobile] Port 8081 is already active." -ForegroundColor Cyan
} else {
    Write-Host "[Mobile] Launching Expo mobile dev server on http://localhost:8081..." -ForegroundColor Yellow
    Start-Process cmd.exe -ArgumentList "/k cd /d `"$rootDir\mobile`" && npx expo start"
}

Write-Host "`nOpening AgriAI web dashboard in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "AgriAI App URLs:" -ForegroundColor White
Write-Host "- Web Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "- API Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "- Swagger Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "- Mobile Metro:  http://localhost:8081" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Green
