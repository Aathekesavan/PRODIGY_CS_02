@echo off
title PIXELCRYPT - Boot Manager
cls
echo =====================================================================
echo                PIXELCRYPT - BOOT MANAGER [V1.0]
echo =====================================================================
echo.
echo Starting application service nodes...
echo.

:: Start Python Flask Backend in a separate window
echo [NODE 1/2] Launching Cryptographic Backend (Flask) on port 5000...
start "PIXELCRYPT Backend Node" cmd /k "cd backend && echo Starting Flask Core... && python app.py"

:: Start React Frontend in a separate window
echo [NODE 2/2] Launching React Development Server (Vite) on port 5173...
start "PIXELCRYPT Frontend Node" cmd /k "cd frontend && echo Starting Vite Dev Server... && npm run dev"

echo.
echo =====================================================================
echo SERVICES INITIATED SUCCESSFULLY.
echo.
echo - Frontend Dashboard: http://localhost:5173
echo - Backend API Engine: http://localhost:5000/api/health
echo.
echo Close the respective cmd windows to shut down nodes.
echo =====================================================================
pause
