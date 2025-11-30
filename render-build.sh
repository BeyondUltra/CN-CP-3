#!/bin/bash
# Build script for Render deployment
# This builds the Vite React frontend

echo "🔨 Installing frontend dependencies..."
npm install

echo "🏗️  Building frontend..."
npm run build

echo "✅ Build complete! Frontend files are in ./dist"

