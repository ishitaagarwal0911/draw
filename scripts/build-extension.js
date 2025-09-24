#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function buildExtension() {
  console.log('🚀 Building Chrome Extension...');
  
  try {
    // Step 1: Copy static assets that don't get processed by Vite
    console.log('📁 Copying static assets...');
    
    // Copy icons
    await copyDirectory('public/icons', 'draw-extension/icons');
    
    // Copy extension-specific assets if any exist
    const assetsPath = 'src/assets';
    try {
      const assetFiles = await fs.readdir(assetsPath);
      for (const file of assetFiles) {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg')) {
          await fs.copyFile(
            path.join(assetsPath, file), 
            path.join('draw-extension/assets', file)
          );
        }
      }
    } catch (err) {
      // Assets directory might not exist or be empty
      console.log('  ℹ️ No additional assets to copy');
    }
    
    // Step 2: Build using the extension-specific Vite config
    console.log('📦 Building React app for extension...');
    const { stdout, stderr } = await execAsync('vite build --config vite.config.extension.ts');
    
    if (stderr && !stderr.includes('warnings')) {
      console.error('Build warnings/errors:', stderr);
    }
    
    console.log('✅ Extension built successfully!');
    console.log('\n📂 Structure in draw-extension/:');
    
    // List the created files with better organization
    await listDirectoryStructure('draw-extension', 0);
    
    console.log('\n🎉 Extension ready! To install:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked" and select the draw-extension/ folder');
    console.log('\n📋 Extension features:');
    console.log('• New tab canvas with drawing tools');
    console.log('• Settings page for customization');
    console.log('• Popup for quick access');
    console.log('• Background service worker');
    console.log('• Content script framework');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Helper function to copy directories
async function copyDirectory(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.log(`  ⚠️ Could not copy ${src}: ${err.message}`);
  }
}

// Helper function to list directory structure
async function listDirectoryStructure(dir, depth = 0) {
  const indent = '  '.repeat(depth);
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries.sort((a, b) => {
      // Directories first, then files
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    })) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        console.log(`${indent}📁 ${entry.name}/`);
        if (depth < 2) { // Limit depth to avoid too much output
          await listDirectoryStructure(fullPath, depth + 1);
        }
      } else {
        const stat = await fs.stat(fullPath);
        const size = (stat.size / 1024).toFixed(1);
        const icon = getFileIcon(entry.name);
        console.log(`${indent}${icon} ${entry.name} (${size}KB)`);
      }
    }
  } catch (err) {
    console.log(`${indent}❌ Error reading directory: ${err.message}`);
  }
}

// Helper to get file icons
function getFileIcon(filename) {
  if (filename.endsWith('.js')) return '⚡';
  if (filename.endsWith('.css')) return '🎨';
  if (filename.endsWith('.html')) return '📄';
  if (filename.endsWith('.json')) return '📋';
  if (filename.endsWith('.png') || filename.endsWith('.jpg')) return '🖼️';
  return '📄';
}

buildExtension();