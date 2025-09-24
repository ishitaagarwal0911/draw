# Canvas by Recess Club - Chrome Extension

Transform your new tab into an infinite whiteboard for doodling, notes, and creative thinking.

## Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build extension
npm run build
```

## Installation as Chrome Extension

1. **Build the extension:**
   ```bash
   npm run build
   ```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` folder

3. **Test:**
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

## Project Structure

```
draw/
├── public/
│   ├── manifest.json     # Chrome extension manifest
│   └── icons/           # Extension icons (16/48/128px)
├── src/
│   ├── main.tsx         # Extension entry point
│   ├── App.tsx          # Main app component
│   ├── newtab.css       # Extension-specific styles
│   └── components/      # Whiteboard components
├── index.html           # Vite HTML template
└── vite.config.ts       # Build configuration
```

## Permissions

- `storage` - For saving whiteboard state
- `unlimitedStorage` - For large whiteboards with many elements

## Technologies

- Vite
- TypeScript
- React
- Fabric.js
- Tailwind CSS
- shadcn-ui
