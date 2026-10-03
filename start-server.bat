@echo off
title AI Club & AI Lab Backend Server
echo ===========================================================
echo   Starting AI Club ^& AI Lab Backend Server (Port 5000)
echo ===========================================================
echo.
cd /d "%~dp0server"
echo [1/2] Verifying dependencies...
call npm.cmd install --no-audit --prefer-offline
echo.
echo [2/2] Starting Express API Server...
echo API Health:  http://localhost:5000/api/health
echo Contact API: http://localhost:5000/api/v1/contact
echo Auth API:    http://localhost:5000/api/v1/auth
echo.
call npm.cmd run dev
pause
