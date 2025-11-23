#!/bin/bash
# Custom install script for Vercel that ignores workspace configuration
set -e

# Change to frontend directory (should already be here, but just in case)
cd "$(dirname "$0")"

# Temporarily rename parent package.json to prevent workspace detection
# This is a workaround for npm's automatic workspace detection
PARENT_PKG="../package.json"
TEMP_PKG="../package.json.vercel-backup"
RESTORED=false

# Function to restore package.json on exit
restore_package_json() {
  if [ "$RESTORED" = false ] && [ -f "$TEMP_PKG" ]; then
    mv "$TEMP_PKG" "$PARENT_PKG"
    RESTORED=true
  fi
}

# Set trap to ensure package.json is restored even on error
trap restore_package_json EXIT ERR

if [ -f "$PARENT_PKG" ]; then
  echo "Temporarily hiding parent package.json to prevent workspace detection"
  mv "$PARENT_PKG" "$TEMP_PKG"
fi

# Install dependencies
npm install --legacy-peer-deps

# Restore parent package.json
restore_package_json

# Verify installation
if [ ! -d "node_modules/next" ]; then
  echo "Error: Next.js was not installed correctly"
  exit 1
fi

echo "Installation completed successfully"

