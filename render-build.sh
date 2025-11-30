#!/bin/bash
# Build script for Render deployment
# This builds the Vite React frontend

set -e  # Exit on any error

echo "🔨 Installing dependencies..."
npm install

echo "🏗️  Building frontend..."
npm run build

echo "📁 Checking build output..."
if [ -d "dist" ]; then
  echo "✅ Build complete! Frontend files are in ./dist"
  echo "📋 Contents of dist directory:"
  ls -la dist/ | head -10
else
  echo "❌ ERROR: dist directory was not created!"
  echo "Build may have failed. Check the output above."
  exit 1
fi

echo "✅ Build script completed successfully"

