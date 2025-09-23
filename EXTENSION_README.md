# Chrome Extension Setup

This whiteboard app can be used as a Chrome extension that replaces your new tab page.

## Building the Extension

1. **Build the extension files:**
   ```bash
   npm run build:extension
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" 
   - Select the `draw-extension/` folder

3. **Test the extension:**
   - Open a new tab in Chrome
   - Your whiteboard should load automatically!

## Development

- **Watch mode for extension development:**
  ```bash
  npm run dev:extension
  ```
  This will rebuild the extension files whenever you make changes.

## Features

- ✅ Infinite whiteboard canvas
- ✅ Drawing tools (pen, shapes, text)
- ✅ Auto-save using Chrome storage
- ✅ Zoom and pan controls
- ✅ Undo/redo functionality
- ✅ Copy/paste support
- ✅ Image drag & drop

## Files Structure

- `draw-extension/manifest.json` - Extension configuration
- `draw-extension/newtab.html` - New tab page HTML
- `draw-extension/newtab.js` - Built extension files (generated)
- `draw-extension/icons/` - Extension icons
- `src/extension.tsx` - Extension entry point
- `src/pages/NewTab.tsx` - Main whiteboard component