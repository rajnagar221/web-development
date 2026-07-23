@echo off
echo ========================================================
echo        STARTING SPOTIFY CLONE (BACKEND + FRONTEND)
echo ========================================================
echo.

start "Musify Backend Server (Port 8000)" cmd /k "cd /d %~dp0backend && python main.py"
timeout /t 2 /nobreak >nul

start "Musify Frontend Server (Port 5500)" cmd /k "cd /d %~dp0frontend && python -m http.server 5500"
timeout /t 2 /nobreak >nul

echo.
echo [SUCCESS] Both servers are running!
echo Frontend: http://localhost:5500
echo Backend:  http://localhost:8000
echo.
start http://localhost:5500
pause
