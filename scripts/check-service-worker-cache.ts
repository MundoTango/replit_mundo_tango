#!/usr/bin/env tsx
/**
 * Service Worker Cache Version Checker
 * Ensures cache version is updated before deployment
 * Run automatically in pre-deployment checks
 */

import * as fs from 'fs';
import * as path from 'path';

const SERVICE_WORKER_PATH = path.join(__dirname, '../client/service-worker.js');
const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');
const DEPLOYMENT_LOG_PATH = path.join(__dirname, '../deployment-cache-versions.log');

interface CacheVersionCheck {
  currentVersion: string | null;
  lastDeployedVersion: string | null;
  isValid: boolean;
  error?: string;
}

function extractCacheVersion(content: string): string | null {
  const match = content.match(/const CACHE_NAME = ['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function getLastDeployedVersion(): string | null {
  if (!fs.existsSync(DEPLOYMENT_LOG_PATH)) {
    return null;
  }
  
  const log = fs.readFileSync(DEPLOYMENT_LOG_PATH, 'utf-8');
  const lines = log.trim().split('\n');
  const lastLine = lines[lines.length - 1];
  
  if (lastLine) {
    const match = lastLine.match(/version: ([^\s]+)/);
    return match ? match[1] : null;
  }
  
  return null;
}

function logDeployment(version: string): void {
  const logEntry = `${new Date().toISOString()} - deployed version: ${version}\n`;
  fs.appendFileSync(DEPLOYMENT_LOG_PATH, logEntry);
}

function checkServiceWorkerCache(): CacheVersionCheck {
  // Check if service worker file exists
  if (!fs.existsSync(SERVICE_WORKER_PATH)) {
    return {
      currentVersion: null,
      lastDeployedVersion: null,
      isValid: false,
      error: 'Service worker file not found'
    };
  }

  // Read service worker content
  const content = fs.readFileSync(SERVICE_WORKER_PATH, 'utf-8');
  
  // Extract current cache version
  const currentVersion = extractCacheVersion(content);
  if (!currentVersion) {
    return {
      currentVersion: null,
      lastDeployedVersion: null,
      isValid: false,
      error: 'Could not find CACHE_NAME in service worker'
    };
  }

  // Get last deployed version
  const lastDeployedVersion = getLastDeployedVersion();

  // Validate version change
  if (lastDeployedVersion && currentVersion === lastDeployedVersion) {
    return {
      currentVersion,
      lastDeployedVersion,
      isValid: false,
      error: `Cache version not updated! Still using: ${currentVersion}`
    };
  }

  // Check for required methods
  const hasSkipWaiting = content.includes('skipWaiting()');
  const hasClientsClaim = content.includes('clients.claim()');

  if (!hasSkipWaiting) {
    return {
      currentVersion,
      lastDeployedVersion,
      isValid: false,
      error: 'Service worker missing skipWaiting() call'
    };
  }

  if (!hasClientsClaim) {
    return {
      currentVersion,
      lastDeployedVersion,
      isValid: false,
      error: 'Service worker missing clients.claim() call'
    };
  }

  return {
    currentVersion,
    lastDeployedVersion,
    isValid: true
  };
}

// Run the check
const result = checkServiceWorkerCache();

if (!result.isValid) {
  console.error('❌ Service Worker Cache Check Failed!');
  console.error(`   Error: ${result.error}`);
  if (result.lastDeployedVersion) {
    console.error(`   Last deployed: ${result.lastDeployedVersion}`);
  }
  console.error('\n📋 Required Actions:');
  console.error('   1. Update CACHE_NAME version in service-worker.js');
  console.error('   2. Ensure skipWaiting() is called in install event');
  console.error('   3. Ensure clients.claim() is called in activate event');
  process.exit(1);
} else {
  console.log('✅ Service Worker Cache Check Passed!');
  console.log(`   Current version: ${result.currentVersion}`);
  if (result.lastDeployedVersion) {
    console.log(`   Previous version: ${result.lastDeployedVersion}`);
  }
  
  // Log successful deployment
  if (process.env.DEPLOY === 'true' && result.currentVersion) {
    logDeployment(result.currentVersion);
    console.log('   ✓ Deployment logged');
  }
}