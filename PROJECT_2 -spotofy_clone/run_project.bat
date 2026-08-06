@echo off
echo ========================================================
echo        STARTING SPOTIFY CLONE (BACKEND + FRONTEND)
echo ========================================================
echo.

echo [1/3] Clearing stale processes on ports 8000 & 5500...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5500 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo [2/3] Launching Musify Backend Server (Port 8000)...
start "Musify Backend Server (Port 8000)" cmd /k "cd /d %~dp0backend && python main.py"
timeout /t 2 /nobreak >nul

echo [3/3] Launching Musify Frontend Server (Port 5500)...
start "Musify Frontend Server (Port 5500)" cmd /k "cd /d %~dp0frontend && python -m http.server 5500"
timeout /t 2 /nobreak >nul

echo.
echo [SUCCESS] Both servers are running!
echo Frontend: http://localhost:5500
echo Backend:  http://localhost:8000
echo.
start http://localhost:5500
pause

