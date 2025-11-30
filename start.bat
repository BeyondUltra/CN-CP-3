@echo off
REM Audio Conference Application Startup Script for Windows

echo 🎧 Starting Audio Conference Application...
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Install backend dependencies if needed
if not exist "server\node_modules" (
    echo 📦 Installing backend dependencies...
    cd server
    npm install
    cd ..
)

echo.
echo 🚀 Starting backend server...
echo Backend will be available at: http://localhost:3001
echo.

REM Start backend server in background
cd server
start /b npm start
cd ..

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Starting frontend development server...
echo Frontend will be available at: http://localhost:5173
echo.

REM Start frontend server
start /b npm run dev

echo.
echo ✅ Both servers are starting...
echo.
echo 📋 Quick Start Guide:
echo 1. Wait for both servers to fully start
echo 2. Open http://localhost:5173 in your browser
echo 3. Enter your username and join the conference
echo 4. Allow microphone permissions when prompted
echo.
echo 🛑 To stop the servers, close this window or press Ctrl+C
echo.

pause
