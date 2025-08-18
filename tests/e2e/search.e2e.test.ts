import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Helper to login
async function loginAsTestUser(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[name="email"]', 'test@mundotango.life');
  await page.fill('[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`);
}

test.describe('Search E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should perform global search', async ({ page }) => {
    // Use global search
    await page.fill('[data-testid="global-search"]', 'tango');
    await page.press('[data-testid="global-search"]', 'Enter');
    
    // Verify search results page
    await expect(page).toHaveURL(/\/search\?q=tango/);
    
    // Should show different result categories
    await expect(page.locator('[data-testid="search-category-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-category-posts"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-category-events"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-category-groups"]')).toBeVisible();
  });

  test('should filter search results by type', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=tango`);
    
    // Filter by users only
    await page.click('[data-testid="filter-users"]');
    
    // Should only show user results
    await expect(page.locator('[data-testid="search-category-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-category-posts"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="search-category-events"]')).not.toBeVisible();
  });

  test('should search with autocomplete suggestions', async ({ page }) => {
    // Start typing in search
    await page.fill('[data-testid="global-search"]', 'mil');
    
    // Wait for suggestions
    await page.waitForSelector('[data-testid="search-suggestions"]');
    
    // Verify suggestions appear
    await expect(page.locator('[data-testid="suggestion-milonga"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggestion-milonguero"]')).toBeVisible();
    
    // Click a suggestion
    await page.click('[data-testid="suggestion-milonga"]');
    
    // Should navigate to search results
    await expect(page).toHaveURL(/\/search\?q=milonga/);
  });

  test('should save and view search history', async ({ page }) => {
    // Perform multiple searches
    const searches = ['Buenos Aires', 'milonga tonight', 'tango lessons'];
    
    for (const query of searches) {
      await page.fill('[data-testid="global-search"]', query);
      await page.press('[data-testid="global-search"]', 'Enter');
      await page.waitForURL(/\/search/);
    }
    
    // Click on search input to see history
    await page.click('[data-testid="global-search"]');
    
    // Should show recent searches
    await expect(page.locator('[data-testid="recent-searches"]')).toBeVisible();
    for (const query of searches.reverse()) {
      await expect(page.locator(`[data-testid="recent-search"]:has-text("${query}")`)).toBeVisible();
    }
  });

  test('should use advanced search filters', async ({ page }) => {
    await page.goto(`${BASE_URL}/search`);
    
    // Open advanced search
    await page.click('[data-testid="advanced-search-toggle"]');
    
    // Set date range
    await page.fill('[data-testid="date-from"]', '2025-08-01');
    await page.fill('[data-testid="date-to"]', '2025-08-31');
    
    // Set location
    await page.fill('[data-testid="location-filter"]', 'Buenos Aires');
    
    // Set price range for events
    await page.fill('[data-testid="price-min"]', '1000');
    await page.fill('[data-testid="price-max"]', '5000');
    
    // Apply filters
    await page.click('[data-testid="apply-advanced-filters"]');
    
    // Verify filtered results
    const results = page.locator('[data-testid="search-result"]');
    const count = await results.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const result = results.nth(i);
      // Check if result matches filters
      const location = await result.locator('[data-testid="result-location"]').textContent();
      expect(location).toContain('Buenos Aires');
    }
  });

  test('should search by hashtag', async ({ page }) => {
    // Click on a hashtag
    await page.goto(`${BASE_URL}/`);
    await page.click('[data-testid="hashtag-tango"]').first();
    
    // Should navigate to hashtag page
    await expect(page).toHaveURL(/\/hashtag\/tango/);
    
    // All posts should contain #tango
    const posts = page.locator('[data-testid="post-item"]');
    const count = await posts.count();
    
    for (let i = 0; i < count; i++) {
      await expect(posts.nth(i)).toContainText('#tango');
    }
  });

  test('should search within specific context', async ({ page }) => {
    // Navigate to a group
    await page.goto(`${BASE_URL}/groups/1`);
    
    // Use group-specific search
    await page.fill('[data-testid="group-search"]', 'practice');
    await page.press('[data-testid="group-search"]', 'Enter');
    
    // Results should be from this group only
    await expect(page.locator('[data-testid="search-context"]')).toContainText('in Buenos Aires Tango Community');
    
    const results = page.locator('[data-testid="group-search-result"]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle search with no results', async ({ page }) => {
    // Search for something unlikely
    await page.fill('[data-testid="global-search"]', 'xyzabc123nonexistent');
    await page.press('[data-testid="global-search"]', 'Enter');
    
    // Should show no results message
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('text="No results found"')).toBeVisible();
    
    // Should suggest alternatives
    await expect(page.locator('[data-testid="search-suggestions-empty"]')).toBeVisible();
  });

  test('should search users by location', async ({ page }) => {
    await page.goto(`${BASE_URL}/search/users`);
    
    // Use location filter
    await page.click('[data-testid="location-dropdown"]');
    await page.fill('[data-testid="city-search"]', 'Buenos Aires');
    await page.click('[data-testid="city-buenos-aires"]');
    
    // Apply filter
    await page.click('[data-testid="apply-location-filter"]');
    
    // All users should be from Buenos Aires
    const users = page.locator('[data-testid="user-result"]');
    const count = await users.count();
    
    for (let i = 0; i < count; i++) {
      const location = await users.nth(i).locator('[data-testid="user-location"]').textContent();
      expect(location).toContain('Buenos Aires');
    }
  });

  test('should search events by date range', async ({ page }) => {
    await page.goto(`${BASE_URL}/search/events`);
    
    // Set this weekend filter
    await page.click('[data-testid="date-preset-this-weekend"]');
    
    // Verify events are within date range
    const events = page.locator('[data-testid="event-result"]');
    const count = await events.count();
    
    const friday = new Date();
    friday.setDate(friday.getDate() + (5 - friday.getDay()));
    const sunday = new Date(friday);
    sunday.setDate(sunday.getDate() + 2);
    
    for (let i = 0; i < count; i++) {
      const dateText = await events.nth(i).locator('[data-testid="event-date"]').textContent();
      const eventDate = new Date(dateText!);
      expect(eventDate).toBeGreaterThanOrEqual(friday);
      expect(eventDate).toBeLessThanOrEqual(sunday);
    }
  });

  test('should save search filters', async ({ page }) => {
    await page.goto(`${BASE_URL}/search`);
    
    // Set up complex filters
    await page.click('[data-testid="advanced-search-toggle"]');
    await page.fill('[data-testid="location-filter"]', 'Palermo');
    await page.click('[data-testid="event-type-milonga"]');
    await page.fill('[data-testid="price-max"]', '3000');
    
    // Save search
    await page.click('[data-testid="save-search-button"]');
    await page.fill('[data-testid="saved-search-name"]', 'Affordable Palermo Milongas');
    await page.click('button:has-text("Save")');
    
    // Navigate away and back
    await page.goto(`${BASE_URL}/`);
    await page.goto(`${BASE_URL}/search`);
    
    // Load saved search
    await page.click('[data-testid="saved-searches-dropdown"]');
    await page.click('[data-testid="saved-search-affordable-palermo-milongas"]');
    
    // Verify filters are restored
    await expect(page.locator('[data-testid="location-filter"]')).toHaveValue('Palermo');
    await expect(page.locator('[data-testid="event-type-milonga"]')).toBeChecked();
    await expect(page.locator('[data-testid="price-max"]')).toHaveValue('3000');
  });

  test('should export search results', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=tango`);
    
    // Export results
    await page.click('[data-testid="export-results-button"]');
    
    // Select format
    await page.click('[data-testid="export-format-csv"]');
    
    // Download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download")')
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toContain('search-results');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should use voice search', async ({ page, context }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone']);
    
    await page.goto(`${BASE_URL}/`);
    
    // Click voice search button
    await page.click('[data-testid="voice-search-button"]');
    
    // Should show listening indicator
    await expect(page.locator('[data-testid="voice-listening"]')).toBeVisible();
    
    // Simulate speech (would need actual implementation)
    // For now, just verify UI elements
    await expect(page.locator('text="Listening..."')).toBeVisible();
    
    // Cancel voice search
    await page.click('[data-testid="voice-cancel"]');
  });

  test('should highlight search terms in results', async ({ page }) => {
    const searchTerm = 'milonga';
    await page.goto(`${BASE_URL}/search?q=${searchTerm}`);
    
    // Get first few results
    const results = page.locator('[data-testid="search-result"]');
    const count = Math.min(await results.count(), 5);
    
    for (let i = 0; i < count; i++) {
      const result = results.nth(i);
      // Check if search term is highlighted
      const highlighted = await result.locator('mark').all();
      expect(highlighted.length).toBeGreaterThan(0);
      
      // Verify highlighted text matches search term
      for (const mark of highlighted) {
        const text = await mark.textContent();
        expect(text?.toLowerCase()).toContain(searchTerm.toLowerCase());
      }
    }
  });
});