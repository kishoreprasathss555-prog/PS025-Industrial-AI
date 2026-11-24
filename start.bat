@echo off
title PS-025 Industrial AI System - Master Launcher
color 0B
echo ==============================================================================
echo       PS-025: AI-POWERED PREDICTIVE TOOL LIFE MONITORING AND OPTIMIZATION
echo                        SAKTHI HACKATHON 2.0 FULL STACK
echo ==============================================================================
echo.
echo Launching Backend API (Port 8000) and Frontend Dashboard (Port 5173)...
echo.

start "PS-025 Backend Server" cmd /k "call START_BACKEND.bat"
timeout /t 3 /nobreak >nul

start "PS-025 Frontend Server" cmd /k "call START_FRONTEND.bat"
timeout /t 3 /nobreak >nul

start http://localhost:5173

echo.
echo ==============================================================================
echo System running!
echo  - Frontend Dashboard: http://localhost:5173
echo  - Backend API:        http://localhost:8000
echo  - API Documentation:  http://localhost:8000/docs
echo.
echo Login Credentials:
echo  - Username: admin
echo  - Password: admin123
echo ==============================================================================
echo.
pause
