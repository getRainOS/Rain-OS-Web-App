#!/bin/bash
set -euo pipefail

echo "=== rain OS AI Readability Optimizer - Replit Build Script ==="
echo ""

echo "1. Checking Node.js and npm versions..."
node -v
npm -v
echo ""

echo "2. Cleaning previous installations..."
rm -rf node_modules package-lock.json
echo "   Done."
echo ""

echo "3. Clearing npm cache..."
npm cache clean --force
echo "   Done."
echo ""

echo "4. Setting npm registry..."
npm config set registry https://registry.npmjs.org/
echo "   Done."
echo ""

echo "5. Installing dependencies..."
npm install --no-audit --no-fund --legacy-peer-deps
echo "   Done."
echo ""

echo "6. Cleaning build directory..."
rm -rf build
echo "   Done."
echo ""

echo "7. Running webpack build..."
npm run build
echo "   Done."
echo ""

echo "8. Verifying build artifacts..."
MISSING_FILES=""

if [ ! -f "build/gutenberg-sidebar.js" ]; then
    MISSING_FILES="$MISSING_FILES gutenberg-sidebar.js"
fi

if [ ! -f "build/gutenberg-sidebar.css" ]; then
    MISSING_FILES="$MISSING_FILES gutenberg-sidebar.css"
fi

if [ ! -f "build/gutenberg-sidebar.asset.php" ]; then
    MISSING_FILES="$MISSING_FILES gutenberg-sidebar.asset.php"
fi

if [ -n "$MISSING_FILES" ]; then
    echo "ERROR: Missing build artifacts:$MISSING_FILES"
    exit 1
fi

echo "   All build artifacts verified:"
ls -la build/
echo ""

echo "=== Build completed successfully! ==="
