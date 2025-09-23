#!/bin/bash

# Build script for Chrome extension
echo "🔨 Building Chrome Extension..."

# Build with extension target
BUILD_TARGET=extension npm run build

echo "✅ Extension built successfully!"
echo "📁 Extension files are in draw-extension/"
echo ""
echo "🚀 To install the extension:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked' and select the draw-extension/ folder"
echo "4. Open a new tab to see your whiteboard!"