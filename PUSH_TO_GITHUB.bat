@echo off
title Push PS-025 to GitHub
color 0B
echo ==============================================================================
echo       PS-025: PUSH TO GITHUB REPOSITORY
echo       Target: https://github.com/kishoreprasathss555-prog/PS025-Industrial-AI.git
echo ==============================================================================
echo.
set GIT="C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
cd /d "%~dp0"

echo Current Remote:
%GIT% remote -v
echo.
echo Pushing branch 'main' to GitHub origin...
echo (If prompted, click Sign in with browser or paste your GitHub Personal Access Token)
echo.
%GIT% push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] PS-025 project successfully uploaded to GitHub!
    echo Visit: https://github.com/kishoreprasathss555-prog/PS025-Industrial-AI
) else (
    echo [ERROR] Push encountered an issue. Please verify your GitHub login or token.
)
echo.
pause
