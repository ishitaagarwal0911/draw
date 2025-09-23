#!/usr/bin/env node

// Build script for Chrome extension
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Building Chrome Extension...');

try {
  // Set environment variable and build
  process.env.BUILD_TARGET = 'extension';
  execSync('vite build', { stdio: 'inherit', env: process.env });
  
  console.log('✅ Extension built successfully!');
  console.log('📁 Extension files are in the draw-extension/ directory');
  console.log('🚀 Load the draw-extension/ folder in Chrome as an unpacked extension');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}