@echo off
REM Quick Verification Script for Spotify Clone

echo.
echo ========================================
echo   SPOTIFY CLONE - VERIFICATION SCRIPT
echo ========================================
echo.

echo [1] Checking Python Installation...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found! Install Python from python.org
    exit /b 1
) else (
    echo ✅ Python is installed
)

echo.
echo [2] Checking MongoDB...
netstat -an | findstr ":27017"
if %errorlevel% neq 0 (
    echo ❌ MongoDB not running on port 27017
    echo    Start MongoDB with: mongod
) else (
    echo ✅ MongoDB is running
)

echo.
echo [3] Backend Directory...
cd backend
if exist requirements.txt (
    echo ✅ Found requirements.txt
) else (
    echo ❌ requirements.txt not found!
    exit /b 1
)

echo.
echo [4] Checking Backend Dependencies...
pip list | findstr "fastapi pymongo"
if %errorlevel% neq 0 (
    echo ❌ Missing dependencies - Run: pip install -r requirements.txt
) else (
    echo ✅ Dependencies installed
)

echo.
echo ========================================
echo   SETUP INSTRUCTIONS:
echo ========================================
echo.
echo 1. Start MongoDB:
echo    mongod
echo.
echo 2. Install dependencies (first time only):
echo    cd backend
echo    pip install -r requirements.txt
echo.
echo 3. Start Backend Server:
echo    cd backend
echo    python -m uvicorn main:app --reload
echo.
echo 4. Open Frontend:
echo    Open index.html in browser
echo    Or use Live Server extension in VS Code
echo.
echo ========================================
echo.
