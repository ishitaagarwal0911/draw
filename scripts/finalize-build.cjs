const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'draw-extension');
const indexHtml = path.join(outDir, 'index.html');
const newtabHtml = path.join(outDir, 'newtab.html');

if (!fs.existsSync(outDir)) {
  console.error('❌ Build output folder not found:', outDir);
  process.exit(1);
}
if (!fs.existsSync(indexHtml)) {
  console.error('❌ index.html not found in build output:', indexHtml);
  process.exit(1);
}

let html = fs.readFileSync(indexHtml, 'utf8');

// --- Fix JS reference ---
html = html.replace(/src=".*?\.js"/, 'src="./newtab.js"');

// --- Find CSS file ---
let cssHref = null;
const assetsDir = path.join(outDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const assets = fs.readdirSync(assetsDir);
  const css = assets.find(f => f.endsWith('.css'));
  if (css) cssHref = `./assets/${css}`;
}
if (!cssHref) {
  const rootCss = fs.readdirSync(outDir).find(f => f.endsWith('.css'));
  if (rootCss) cssHref = `./${rootCss}`;
}

// --- Inject CSS link if missing ---
if (cssHref && !html.includes(cssHref)) {
  html = html.replace('</title>', `</title>\n  <link rel="stylesheet" href="${cssHref}">`);
}

// --- Write newtab.html & clean up ---
fs.writeFileSync(newtabHtml, html, 'utf8');
try { fs.unlinkSync(indexHtml); } catch (e) {}

console.log(`✅ newtab.html created (points to newtab.js and ${cssHref || 'no css'})`);
