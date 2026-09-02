@echo off
title Synth Layered Local Web Server
echo ===================================================
echo   Starting Synth Layered Local Web Server...
echo   Port: 8092
echo ===================================================
python serve.py
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python is not installed or not in PATH.
    echo Please make sure Python is installed to run the local server.
)
pause
