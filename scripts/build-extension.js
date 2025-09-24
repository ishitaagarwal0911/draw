#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function buildExtension() {
  console.log('🚀 Building Chrome Extension...');
  
  try {
    // Build using the extension-specific Vite config
    console.log('📦 Building React app for extension...');
    const { stdout, stderr } = await execAsync('vite build --config vite.config.extension.ts');
    
    if (stderr && !stderr.includes('warnings')) {
      console.error('Build warnings/errors:', stderr);
    }
    
    console.log('✅ Extension built successfully!');
    console.log('\n📂 Files created in draw-extension/:');
    
    // List the created files
    const files = await fs.readdir('draw-extension');
    for (const file of files.sort()) {
      const stat = await fs.stat(path.join('draw-extension', file));
      if (stat.isDirectory()) {
        console.log(`  📁 ${file}/`);
      } else {
        const size = (stat.size / 1024).toFixed(1);
        console.log(`  📄 ${file} (${size}KB)`);
      }
    }
    
    console.log('\n🎉 Extension ready! To install:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked" and select the draw-extension/ folder');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildExtension();