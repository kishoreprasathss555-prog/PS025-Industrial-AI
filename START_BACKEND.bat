@echo off
title PS-025 Industrial AI - Backend Service
color 0B
echo ==============================================================================
echo       PS-025: AI-POWERED PREDICTIVE TOOL LIFE MONITORING SYSTEM
echo                     FASTAPI BACKEND SERVICE LAUNCHER
echo ==============================================================================
echo.

set PY="C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 set PY=python

cd /d "%~dp0backend"
echo [1/2] Initializing SQLite database...
%PY% init_db.py

echo.
echo [2/2] Starting Uvicorn REST API server on port 8000...
echo API Docs: http://localhost:8000/docs
echo.
%PY% -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
