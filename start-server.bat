@echo off
echo 🎧 Starting Audio Conference Server...
echo =====================================

echo 📍 Current directory: %CD%
echo.

echo 🔍 Detecting local IP address...
echo.

cd server
echo 📂 Changed to server directory: %CD%
echo.

echo 🚀 Starting server...
echo.
node server.js

pause
