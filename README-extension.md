# Chrome Extension Build Instructions

## Building the Extension

To build the Chrome extension from the React source code:

### Method 1: Using the build script
```bash
chmod +x build-extension.sh
./build-extension.sh
```

### Method 2: Using Vite directly
```bash
npx vite build --config vite.config.extension.ts
```

### Method 3: Using the Node.js script
```bash
node scripts/build-extension.js
```

## Development Workflow

1. **Source Development**: Work in the `src/` directory as usual
2. **Extension Building**: Run build command to generate extension files
3. **Testing**: Load the `draw-extension/` folder in Chrome
4. **Iteration**: Rebuild after making changes

## File Structure

After building, the `draw-extension/` directory contains:

```
draw-extension/
├── manifest.json        # ✅ Extension manifest (already exists)
├── newtab.html         # ✅ Entry HTML (already exists)  
├── newtab.js           # 🔄 Generated from React app
├── newtab.css          # 🔄 Generated from Tailwind/CSS
├── icons/              # ✅ Extension icons (already exist)
├── assets/             # ✅ Static assets (already exist)
├── background/         # ✅ Service worker (already exists)
├── options.html        # ✅ Settings page (already exists)
├── popup.html          # ✅ Popup interface (already exists)
└── content-scripts/    # ✅ Web page scripts (already exist)
```

## What Gets Built

- **newtab.js**: Complete React application bundle including:
  - All React components
  - Fabric.js canvas functionality
  - Chrome storage integration
  - Theme system
  - All drawing tools and features

- **newtab.css**: Complete stylesheet including:
  - Tailwind CSS utilities
  - Design system tokens
  - Canvas-specific styles
  - Theme variables (light/dark)

## Chrome Installation

1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `draw-extension/` folder
5. Open a new tab to see your whiteboard!

## Preserving Functionality

The build process ensures that ALL existing functionality is preserved:
- ✅ Drawing tools (pen, shapes, text)
- ✅ Chrome storage for persistence
- ✅ Zoom and pan controls
- ✅ Undo/redo functionality
- ✅ Theme switching (dark/light)
- ✅ Copy/paste support
- ✅ Image drag & drop
- ✅ All keyboard shortcuts

No functionality is lost in the extension conversion!