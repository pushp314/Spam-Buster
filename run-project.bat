@echo off
setlocal
echo ==========================================
echo    SPAM BUSTER - ALL-IN-ONE LAUNCHER
echo ==========================================

:: 1. Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is missing. Please install it from https://nodejs.org/
    pause
    exit /b
)

:: 2. Handle Redis (Portable)
if not exist "redis-bin\redis-server.exe" (
    echo [!] Downloading Redis Portable for Windows...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; New-Item -ItemType Directory -Path 'redis-bin' -Force; Invoke-WebRequest -Uri 'https://github.com/tporadowski/redis/releases/download/v5.0.14/Redis-x64-5.0.14.zip' -OutFile 'redis-bin\redis.zip'; Expand-Archive -Path 'redis-bin\redis.zip' -DestinationPath 'redis-bin' -Force; Remove-Item 'redis-bin\redis.zip'"
)

:: 3. Setup .env
if not exist "server\.env" (
    echo [!] Creating .env file...
    copy server\.env.example server\.env >nul
)

:: 4. Install dependencies if missing
if not exist "server\node_modules" (
    echo [!] Installing dependencies (First time only)...
    cd server && npm install && cd ..
    cd client && npm install && cd ..
)

:: 5. Start Everything
echo [OK] Starting Redis...
start "Redis" /min cmd /c "cd redis-bin && redis-server.exe"

echo [OK] Starting Project Services...
start "Backend" cmd /c "cd server && npm run dev"
start "Frontend" cmd /c "cd client && npm run dev"

echo.
echo ==========================================
echo    RUNNING ON http://localhost:5173
echo ==========================================
echo Note: Don't forget to add API keys to 'server\.env'
echo.
pause
