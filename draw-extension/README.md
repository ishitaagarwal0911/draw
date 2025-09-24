# Canvas by Recess Club - Chrome Extension

Transform your new tab into an infinite whiteboard for doodling, notes, and creative thinking.

## Installation as Chrome Extension

1. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `draw-extension/` folder

2. **Test:**
   - Open a new tab in Chrome
   - Your whiteboard should load automatically!

## Features

- ✅ Infinite whiteboard canvas
- ✅ Drawing tools (pen, shapes, text)
- ✅ Auto-save using Chrome storage
- ✅ Zoom and pan controls
- ✅ Undo/redo functionality
- ✅ Copy/paste support
- ✅ Image drag & drop
- ✅ Dark/light theme support

## Extension Structure

```
draw-extension/
├── manifest.json        # Chrome extension manifest (Manifest V3)
├── README.md           # This file
├── newtab.html         # New tab page
├── newtab.css          # Styles for the extension
├── newtab.js           # Main application logic
├── icons/              # Extension icons (16/48/128px)
├── assets/             # Static assets (images, fonts)
├── background/         # Service worker for background tasks
├── options.html        # Extension settings page
├── popup.html          # Toolbar popup interface
└── content-scripts/    # Scripts for web page integration
```

## Permissions

- `storage` - For saving whiteboard state
- `unlimitedStorage` - For large whiteboards with many elements

## Development

To build the extension from source, see the main project README in the parent directory.

## Technologies

- Manifest V3
- React + TypeScript
- Fabric.js for canvas
- Tailwind CSS for styling
- Chrome Storage API