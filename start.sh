#!/bin/bash

# Audio Conference Application Startup Script

echo "🎧 Starting Audio Conference Application..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server
    npm install
    cd ..
fi

echo ""
echo "🚀 Starting backend server..."
echo "Backend will be available at: http://localhost:3001"
echo ""

# Start backend server in background
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait a moment for server to start
sleep 3

echo ""
echo "🌐 Starting frontend development server..."
echo "Frontend will be available at: http://localhost:5173"
echo ""

# Start frontend server
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo ""
echo "📋 Quick Start Guide:"
echo "1. Wait for both servers to fully start"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Enter your username and join the conference"
echo "4. Allow microphone permissions when prompted"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
