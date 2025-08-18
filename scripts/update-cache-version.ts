#!/usr/bin/env tsx
/**
 * Automated Cache Version Updater
 * Generates new cache version based on date and build number
 * Run before deployment to ensure unique cache versions
 */

import * as fs from 'fs';
import * as path from 'path';

const SERVICE_WORKER_PATH = path.join(__dirname, '../client/service-worker.js');
const CACHE_MONITOR_PATH = path.join(__dirname, '../client/src/utils/cache-monitor.ts');

function generateNewVersion(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const buildNumber = Math.floor(date.getTime() / 1000) % 10000;
  return `life-ceo-v${dateStr}-${buildNumber}`;
}

function updateServiceWorker(newVersion: string): boolean {
  try {
    const content = fs.readFileSync(SERVICE_WORKER_PATH, 'utf-8');
    const updated = content.replace(
      /const CACHE_NAME = ['"]([^'"]+)['"]/,
      `const CACHE_NAME = '${newVersion}'`
    );
    
    if (updated === content) {
      console.error('Failed to update service worker cache version');
      return false;
    }
    
    fs.writeFileSync(SERVICE_WORKER_PATH, updated);
    return true;
  } catch (error) {
    console.error('Error updating service worker:', error);
    return false;
  }
}

function updateCacheMonitor(newVersion: string): boolean {
  try {
    const content = fs.readFileSync(CACHE_MONITOR_PATH, 'utf-8');
    const updated = content.replace(
      /private expectedVersion = ['"]([^'"]+)['"]/,
      `private expectedVersion = '${newVersion}'`
    );
    
    if (updated === content) {
      console.error('Failed to update cache monitor version');
      return false;
    }
    
    fs.writeFileSync(CACHE_MONITOR_PATH, updated);
    return true;
  } catch (error) {
    console.error('Error updating cache monitor:', error);
    return false;
  }
}

// Run the update
const newVersion = generateNewVersion();
console.log(`📦 Updating cache version to: ${newVersion}`);

const swUpdated = updateServiceWorker(newVersion);
const monitorUpdated = updateCacheMonitor(newVersion);

if (swUpdated && monitorUpdated) {
  console.log('✅ Cache version updated successfully!');
  console.log('   Service Worker: ✓');
  console.log('   Cache Monitor: ✓');
  process.exit(0);
} else {
  console.error('❌ Failed to update cache version');
  if (!swUpdated) console.error('   Service Worker: ✗');
  if (!monitorUpdated) console.error('   Cache Monitor: ✗');
  process.exit(1);
}