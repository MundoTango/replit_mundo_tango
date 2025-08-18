#!/usr/bin/env node

/**
 * ESA 50x21s Security Sanitization Script
 * Removes all proprietary references from codebase
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to replace
const replacements = [
  // Framework references
  { pattern: /Life CEO 44x21s? Framework/gi, replacement: 'Comprehensive Platform' },
  { pattern: /44x21s? Framework/gi, replacement: 'Development Framework' },
  { pattern: /44x21/gi, replacement: '50x21' },
  { pattern: /Framework44x21/g, replacement: 'Framework50x21' },
  { pattern: /Phase44x21/g, replacement: 'Phase50x21' },
  
  // Life CEO references (keep in internal components, remove from external)
  { pattern: /Life CEO 16-Agent System/gi, replacement: 'Intelligent System' },
  { pattern: /16 AI Agents/gi, replacement: 'AI-powered features' },
  { pattern: /ESA methodology/gi, replacement: 'systematic approach' },
  { pattern: /ESA-44x21/gi, replacement: 'ESA-50x21' },
  
  // Marketing sanitization
  { pattern: /proprietary methodology/gi, replacement: 'platform features' },
  { pattern: /trade secrets/gi, replacement: 'platform capabilities' },
];

// Files to process
const filePatterns = [
  'client/**/*.{ts,tsx,js,jsx}',
  'server/**/*.{ts,js}',
  'shared/**/*.{ts,js}',
  'life-ceo/docs/*.md',
  '*.md'
];

let totalReplacements = 0;
let filesModified = 0;

function sanitizeFile(filePath) {
  // Skip node_modules and build directories
  if (filePath.includes('node_modules') || filePath.includes('dist') || filePath.includes('build')) {
    return;
  }
  
  // Skip the audit file itself
  if (filePath.includes('ESA-50x21-platform-audit.md')) {
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileReplacements = 0;
    
    replacements.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fileReplacements += matches.length;
      }
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Sanitized ${filePath} (${fileReplacements} replacements)`);
      totalReplacements += fileReplacements;
      filesModified++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🔒 ESA 50x21s Security Sanitization Starting...\n');

filePatterns.forEach(pattern => {
  const files = glob.sync(pattern);
  files.forEach(sanitizeFile);
});

console.log('\n📊 Sanitization Complete:');
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`   Security level: ${totalReplacements === 0 ? '✅ 100% Secure' : '⚠️ Needs review'}`);