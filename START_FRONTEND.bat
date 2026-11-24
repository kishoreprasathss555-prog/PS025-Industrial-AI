@echo off
title PS-025 Industrial AI - React Frontend
color 0A
echo ==============================================================================
echo       PS-025: AI-POWERED PREDICTIVE TOOL LIFE MONITORING SYSTEM
echo                     REACT + VITE FRONTEND LAUNCHER
echo ==============================================================================
echo.

cd /d "%~dp0frontend"

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js / npm was not found!
    echo Please install Node.js (LTS version) from https://nodejs.org/
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)

echo Starting Vite development server...
echo Access URL: http://localhost:5173
call npm run dev
pause
