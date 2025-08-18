import { test, expect, chromium } from '@playwright/test';

test.describe('ESA Platform Basic Tests', () => {
  test('platform loads successfully', async () => {
    // Launch browser with Replit-compatible settings
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Test homepage loads
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Test memories page
    const memoriesHeading = await page.locator('h1:has-text("Memories Feed")').first();
    await expect(memoriesHeading).toBeVisible({ timeout: 10000 });
    
    // Test community map
    await page.goto('http://localhost:5000/community');
    await page.waitForLoadState('networkidle');
    const communityHeading = await page.locator('h1:has-text("Tango World Map")').first();
    await expect(communityHeading).toBeVisible({ timeout: 10000 });
    
    // Verify map container exists
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    const mapExists = await page.locator('.leaflet-container').isVisible();
    expect(mapExists).toBeTruthy();
    
    console.log('✅ All basic tests passed!');
    
    await browser.close();
  });
});