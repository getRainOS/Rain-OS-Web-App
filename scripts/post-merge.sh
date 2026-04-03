#!/bin/bash
set -e

echo "Installing web-app dependencies..."
cd web-app
npm install
cd ..

if [ -f "backend/package.json" ]; then
  echo "Installing backend dependencies..."
  cd backend
  npm install --ignore-scripts
  cd ..
fi

echo "Post-merge setup complete."
