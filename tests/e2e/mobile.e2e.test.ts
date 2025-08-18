import { test, expect, Page, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Use iPhone 12 viewport
test.use({ ...devices['iPhone 12'] });

// Helper to login
async function loginAsTestUser(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[name="email"]', 'test@mundotango.life');
  await page.fill('[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`);
}

test.describe('Mobile E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should navigate using mobile menu', async ({ page }) => {
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Verify menu items
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('text="Feed"')).toBeVisible();
    await expect(page.locator('text="Events"')).toBeVisible();
    await expect(page.locator('text="Groups"')).toBeVisible();
    await expect(page.locator('text="Messages"')).toBeVisible();
    
    // Navigate to events
    await page.click('text="Events"');
    await expect(page).toHaveURL(`${BASE_URL}/events`);
  });

  test('should create post on mobile', async ({ page }) => {
    // Click floating action button
    await page.click('[data-testid="mobile-fab"]');
    
    // Select create post
    await page.click('[data-testid="fab-create-post"]');
    
    // Fill post content
    await page.fill('[data-testid="mobile-post-input"]', 'Mobile test post! #mobile');
    
    // Add photo
    await page.click('[data-testid="mobile-add-photo"]');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/mobile-photo.jpg');
    
    // Submit
    await page.click('[data-testid="mobile-post-submit"]');
    
    // Verify post created
    await expect(page.locator('[data-testid="post-item"]:has-text("Mobile test post!")')).toBeVisible();
  });

  test('should use swipe gestures', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    
    // Get initial post
    const firstPost = await page.locator('[data-testid="post-item"]').first().textContent();
    
    // Swipe up to scroll
    await page.locator('[data-testid="feed-container"]').swipe({
      direction: 'up',
      distance: 300
    });
    
    // Verify scrolled
    const visiblePost = await page.locator('[data-testid="post-item"]').first().textContent();
    expect(visiblePost).not.toBe(firstPost);
  });

  test('should handle mobile notifications', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);
    
    // Enable notifications
    await page.click('[data-testid="mobile-menu-button"]');
    await page.click('text="Settings"');
    await page.click('[data-testid="notifications-settings"]');
    
    // Enable push notifications
    await page.check('[data-testid="enable-push-notifications"]');
    
    // Verify enabled
    await expect(page.locator('text="Push notifications enabled"')).toBeVisible();
  });

  test('should use mobile-optimized event view', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-event-list"]')).toBeVisible();
    
    // Click on event card
    const eventCard = page.locator('[data-testid="mobile-event-card"]').first();
    await eventCard.click();
    
    // Should show mobile event details
    await expect(page.locator('[data-testid="mobile-event-details"]')).toBeVisible();
    
    // Quick RSVP button should be prominent
    await expect(page.locator('[data-testid="mobile-rsvp-button"]')).toBeVisible();
  });

  test('should handle offline mode', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Try to load feed
    await page.goto(`${BASE_URL}/feed`);
    
    // Should show offline message
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
    await expect(page.locator('text="You are offline"')).toBeVisible();
    
    // Should show cached content
    await expect(page.locator('[data-testid="cached-indicator"]')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Should sync
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
  });

  test('should use mobile chat interface', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Verify mobile chat list
    await expect(page.locator('[data-testid="mobile-chat-list"]')).toBeVisible();
    
    // Open chat
    await page.locator('[data-testid="mobile-chat-item"]').first().click();
    
    // Should show full-screen chat
    await expect(page.locator('[data-testid="mobile-chat-view"]')).toBeVisible();
    
    // Quick reply bar at bottom
    await expect(page.locator('[data-testid="mobile-quick-reply"]')).toBeVisible();
  });

  test('should handle mobile image viewer', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    
    // Click on post image
    const postImage = page.locator('[data-testid="post-image"]').first();
    await postImage.click();
    
    // Should open fullscreen viewer
    await expect(page.locator('[data-testid="mobile-image-viewer"]')).toBeVisible();
    
    // Test pinch to zoom
    await page.locator('[data-testid="mobile-image-viewer"]').pinch({
      scale: 2
    });
    
    // Close viewer
    await page.locator('[data-testid="close-viewer"]').click();
  });

  test('should use mobile-friendly forms', async ({ page }) => {
    await page.goto(`${BASE_URL}/events/create`);
    
    // Check mobile form layout
    await expect(page.locator('[data-testid="mobile-form"]')).toBeVisible();
    
    // Input should trigger appropriate keyboard
    await page.click('[name="eventDate"]');
    // Date picker should appear
    await expect(page.locator('[data-testid="mobile-date-picker"]')).toBeVisible();
    
    // Number input should show numeric keyboard
    await page.click('[name="price"]');
    const priceInput = page.locator('[name="price"]');
    await expect(priceInput).toHaveAttribute('inputmode', 'numeric');
  });

  test('should handle mobile location services', async ({ page, context }) => {
    // Grant location permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: -34.603722, longitude: -58.381592 }); // Buenos Aires
    
    await page.goto(`${BASE_URL}/events`);
    
    // Use location filter
    await page.click('[data-testid="mobile-location-button"]');
    
    // Should detect current location
    await expect(page.locator('text="Near Buenos Aires"')).toBeVisible();
    
    // Events should be sorted by distance
    const firstEvent = page.locator('[data-testid="mobile-event-card"]').first();
    await expect(firstEvent.locator('[data-testid="event-distance"]')).toBeVisible();
  });

  test('should handle pull to refresh', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    
    // Get initial content
    const initialContent = await page.locator('[data-testid="post-item"]').first().textContent();
    
    // Pull to refresh
    await page.locator('[data-testid="feed-container"]').swipe({
      direction: 'down',
      distance: 150,
      startPosition: { x: 0, y: 0 }
    });
    
    // Should show refresh indicator
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible();
    
    // Wait for refresh
    await page.waitForSelector('[data-testid="refresh-complete"]');
  });

  test('should use mobile search', async ({ page }) => {
    // Click search icon
    await page.click('[data-testid="mobile-search-icon"]');
    
    // Should show fullscreen search
    await expect(page.locator('[data-testid="mobile-search-overlay"]')).toBeVisible();
    
    // Type search
    await page.fill('[data-testid="mobile-search-input"]', 'milonga');
    
    // Should show instant results
    await expect(page.locator('[data-testid="mobile-search-results"]')).toBeVisible();
    
    // Click result
    await page.click('[data-testid="mobile-search-result"]').first();
  });

  test('should handle mobile file uploads', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    
    // Update profile photo
    await page.click('[data-testid="mobile-profile-photo"]');
    
    // Should show mobile upload options
    await expect(page.locator('[data-testid="mobile-upload-menu"]')).toBeVisible();
    await expect(page.locator('text="Take Photo"')).toBeVisible();
    await expect(page.locator('text="Choose from Library"')).toBeVisible();
    
    // Select from library
    await page.click('text="Choose from Library"');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/profile-mobile.jpg');
    
    // Should show crop interface
    await expect(page.locator('[data-testid="mobile-image-crop"]')).toBeVisible();
  });

  test('should optimize for slow connections', async ({ page, context }) => {
    // Simulate slow 3G
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      await route.continue();
    });
    
    await page.goto(`${BASE_URL}/feed`);
    
    // Should show loading placeholders
    await expect(page.locator('[data-testid="mobile-skeleton-loader"]')).toBeVisible();
    
    // Should load low-res images first
    await page.waitForSelector('[data-testid="low-res-image"]');
    
    // Then high-res
    await page.waitForSelector('[data-testid="high-res-image"]');
  });

  test('should handle app installation prompt', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Should show install prompt after some interaction
    await page.click('[data-testid="post-item"]').first();
    await page.waitForTimeout(2000);
    
    // Check for install banner
    if (await page.locator('[data-testid="install-prompt"]').isVisible()) {
      // Click install
      await page.click('[data-testid="install-app-button"]');
      
      // Should trigger browser install dialog
      // (Can't fully test browser dialog in Playwright)
    }
    
    // Can dismiss prompt
    await page.click('[data-testid="dismiss-install"]');
    await expect(page.locator('[data-testid="install-prompt"]')).not.toBeVisible();
  });
});