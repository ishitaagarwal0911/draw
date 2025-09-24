#!/bin/bash

echo "🚀 Building Chrome Extension..."

# Step 1: Copy static assets that don't get processed by Vite
echo "📁 Copying static assets..."

# Create directories and copy icons
mkdir -p draw-extension/icons
mkdir -p draw-extension/assets
mkdir -p draw-extension/build/chunks

# Copy icons from public directory
if [ -d "public/icons" ]; then
    cp -r public/icons/* draw-extension/icons/
    echo "  ✅ Icons copied"
else
    echo "  ⚠️ No icons directory found"
fi

# Copy additional assets from src/assets if they exist
if [ -d "src/assets" ]; then
    for file in src/assets/*.{png,jpg,jpeg,svg}; do
        if [ -f "$file" ]; then
            cp "$file" draw-extension/assets/
        fi
    done
    echo "  ✅ Assets copied"
fi

# Step 2: Build the extension using the extension-specific Vite config
echo "📦 Building React app for extension..."
npx vite build --config vite.config.extension.ts

if [ $? -eq 0 ]; then
    echo "✅ Extension built successfully!"
    echo ""
    echo "📂 Structure in draw-extension/:"
    ls -la draw-extension/
    echo ""
    echo "📁 Subdirectories:"
    for dir in draw-extension/*/; do
        if [ -d "$dir" ]; then
            echo "  $(basename "$dir")/"
            ls -la "$dir" | head -5
        fi
    done
    echo ""
    echo "🎉 Extension ready! To install:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode'"
    echo "3. Click 'Load unpacked' and select the draw-extension/ folder"
    echo ""
    echo "📋 Extension features:"
    echo "• New tab canvas with drawing tools"
    echo "• Settings page for customization" 
    echo "• Popup for quick access"
    echo "• Background service worker"
    echo "• Content script framework"
else
    echo "❌ Build failed!"
    exit 1
fi