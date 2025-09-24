#!/bin/bash

echo "🚀 Building Chrome Extension..."

# Build the extension using the extension-specific Vite config
echo "📦 Building React app for extension..."
npx vite build --config vite.config.extension.ts

if [ $? -eq 0 ]; then
    echo "✅ Extension built successfully!"
    echo ""
    echo "📂 Files in draw-extension/:"
    ls -la draw-extension/
    echo ""
    echo "🎉 Extension ready! To install:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode'"
    echo "3. Click 'Load unpacked' and select the draw-extension/ folder"
else
    echo "❌ Build failed!"
    exit 1
fi