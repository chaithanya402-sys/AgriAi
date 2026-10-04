@echo off
title AgriAI - Stop All Services
echo ========================================================
echo        AgriAI - Stopping All Services
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop_all.ps1"
pause
