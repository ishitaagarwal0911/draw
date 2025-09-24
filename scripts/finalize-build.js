/**
 * finalize-build.js
 * - Reads draw-extension/index.html (Vite build output)
 * - Ensures it references ./newtab.js (entry) and the built CSS (assets/*.css)
 * - Writes draw-extension/newtab.html and removes index.html
 */
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'draw-extension');
const indexHtml = path.join(outDir, 'index.html');
const newtabHtml = path.join(outDir, 'newtab.html');

if (!fs.existsSync(outDir)) {
  console.error('Build output folder not found:', outDir);
  process.exit(1);
}
if (!fs.existsSync(indexHtml)) {
  console.error('index.html not found in build output. Expected at:', indexHtml);
  process.exit(1);
}

let html = fs.readFileSync(indexHtml, 'utf8');

// 1) Ensure entry script points to ./newtab.js
html = html.replace(/src=".*?\.js"/, 'src="./newtab.js"');

// 2) Find a CSS file (prefer assets/*.css) and get its href
let cssHref = null;
const assetsDir = path.join(outDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const assets = fs.readdirSync(assetsDir);
  const css = assets.find(f => f.endsWith('.css'));
  if (css) cssHref = `./assets/${css}`;
}
// fallback: look in root
if (!cssHref) {
  const rootCss = fs.readdirSync(outDir).find(f => f.endsWith('.css'));
  if (rootCss) cssHref = `./${rootCss}`;
}

// 3) Inject CSS link if we found one and it's not already present
if (cssHref && !html.includes(cssHref)) {
  // prefer to insert after </title> (safe)
  html = html.replace('</title>', `</title>\n  <link rel="stylesheet" href="${cssHref}">`);
}

// 4) Write newtab.html and remove index.html
fs.writeFileSync(newtabHtml, html, 'utf8');
try { fs.unlinkSync(indexHtml); } catch (e) { /* ignore */ }

console.log('✅ newtab.html created (references newtab.js and', cssHref || 'no css found', ')');
