# Tab Canvas Scribe - Chrome Extension

Transform your new tab into an infinite whiteboard for doodling, notes, and creative thinking.

## Installation

### For Users
1. Download the extension from Chrome Web Store (coming soon)
2. Or load this directory as an unpacked extension in Chrome Developer mode

### For Developers
1. Clone the repository
2. Run `npm run build:extension`
3. Load the `draw-extension/` folder as an unpacked extension

## Development

To build the extension:
```bash
npm run build:extension
```

To develop with auto-rebuild:
```bash
npm run dev:extension
```

## Features

- ✅ Infinite whiteboard canvas
- ✅ Drawing tools (pen, shapes, text)
- ✅ Auto-save using Chrome storage
- ✅ Zoom and pan controls
- ✅ Undo/redo functionality
- ✅ Copy/paste support
- ✅ Image drag & drop
- ✅ Dark/light theme support

## Directory Structure

- `manifest.json` - Extension configuration
- `newtab.html` - New tab page HTML
- `newtab.css` - Styles for the extension
- `newtab.js` - Main extension JavaScript (generated)
- `icons/` - Extension icons
- `assets/` - Additional assets (if needed)

## Permissions

- `storage` - For saving whiteboard state
- `unlimitedStorage` - For large whiteboards with many elements