@echo off
title AgriAI - All Services Starter
echo ========================================================
echo        AgriAI - Starting All Services
echo ========================================================
echo.

set ROOT_DIR=%~dp0

:: 1. Start Backend (FastAPI on Port 8000)
netstat -ano | findstr ":8000 " >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [Backend] Port 8000 is already active.
) else (
    echo [Backend] Launching FastAPI backend on http://localhost:8000...
    start "AgriAI Backend (FastAPI)" cmd /k "cd /d %ROOT_DIR%agri-ai\backend && .\.venv311\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
)

:: 2. Start Frontend (React + Vite on Port 5173)
netstat -ano | findstr ":5173 " >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [Frontend] Port 5173 is already active.
) else (
    echo [Frontend] Launching Vite frontend on http://localhost:5173...
    start "AgriAI Frontend (Vite)" cmd /k "cd /d %ROOT_DIR%agri-ai\frontend && npm run dev"
)

:: 3. Start Mobile (Expo on Port 8081)
netstat -ano | findstr ":8081 " >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [Mobile] Port 8081 is already active.
) else (
    echo [Mobile] Launching Expo mobile dev server on http://localhost:8081...
    start "AgriAI Mobile (Expo)" cmd /k "cd /d %ROOT_DIR%mobile && npx expo start"
)

echo.
echo Opening AgriAI web dashboard in your browser...
start http://localhost:5173
echo.
echo ========================================================
echo AgriAI App URLs:
echo - Web Dashboard: http://localhost:5173
echo - API Backend:   http://localhost:8000
echo - Swagger Docs:  http://localhost:8000/docs
echo - Mobile Metro:  http://localhost:8081
echo ========================================================
echo.
pause
