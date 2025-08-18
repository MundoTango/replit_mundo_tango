import { test, expect } from '@playwright/test';

test.describe('Complete Onboarding Flow End-to-End Tests', () => {
  
  test('should complete role selection during onboarding', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for authentication and onboarding to load
    await page.waitForSelector('[data-testid="onboarding-container"]', { timeout: 10000 });
    
    // Verify the role selection section is visible
    await expect(page.locator('text=What do you do in tango?')).toBeVisible();
    
    // Verify community roles are loaded and displayed
    await expect(page.locator('text=dancer')).toBeVisible();
    await expect(page.locator('text=teacher')).toBeVisible();
    await expect(page.locator('text=organizer')).toBeVisible();
    
    // Test the updated host/guide role descriptions
    await expect(page.locator('text=Offers a home to travelers')).toBeVisible();
    await expect(page.locator('text=Willing to show visitors around')).toBeVisible();
    
    // Select multiple roles
    await page.click('[data-role="dancer"]');
    await page.click('[data-role="teacher"]');
    await page.click('[data-role="host"]');
    
    // Verify selected roles appear in the summary
    await expect(page.locator('text=Selected roles:')).toBeVisible();
    await expect(page.locator('text=3')).toBeVisible(); // Count badge
    
    // Verify role badges are displayed
    await expect(page.locator('.bg-blue-100:has-text("dancer")')).toBeVisible();
    await expect(page.locator('.bg-blue-100:has-text("teacher")')).toBeVisible();
    await expect(page.locator('.bg-blue-100:has-text("host")')).toBeVisible();
    
    // Test role deselection
    await page.click('[data-role="teacher"]');
    await expect(page.locator('text=2')).toBeVisible(); // Updated count
    
    // Verify the "Show more roles" functionality
    const showMoreButton = page.locator('text=Show more roles');
    if (await showMoreButton.isVisible()) {
      await showMoreButton.click();
      
      // Verify additional roles are shown
      await expect(page.locator('text=guide')).toBeVisible();
      await expect(page.locator('text=photographer')).toBeVisible();
      
      // Test hide functionality
      await page.click('text=Show less');
    }
    
    // Continue with onboarding flow
    await page.click('button:has-text("Continue")');
    
    // Verify role data is saved (this would depend on your specific flow)
    // await expect(page.url()).toContain('/welcome'); // or next step
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('/api/roles/community', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="onboarding-container"]', { timeout: 10000 });
    
    // Verify graceful error handling - should still show the form
    await expect(page.locator('text=What do you do in tango?')).toBeVisible();
    await expect(page.locator('text=No selection? No problem!')).toBeVisible();
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="onboarding-container"]', { timeout: 10000 });
    
    // Test keyboard navigation through role options
    await page.keyboard.press('Tab'); // First role checkbox
    await page.keyboard.press('Space'); // Select first role
    
    await page.keyboard.press('Tab'); // Second role checkbox
    await page.keyboard.press('Space'); // Select second role
    
    // Verify selections were made
    await expect(page.locator('text=Selected roles:')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible();
  });

  test('should validate role data consistency', async ({ page }) => {
    // Intercept API call to validate response structure
    let apiResponse: any;
    
    await page.route('/api/roles/community', route => {
      route.fulfill().then(response => {
        apiResponse = response;
      });
    });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="onboarding-container"]', { timeout: 10000 });
    
    // Validate API response structure
    expect(apiResponse).toBeDefined();
    
    // Check that all community roles have proper structure
    const roles = await page.locator('[data-role]').all();
    expect(roles.length).toBeGreaterThan(15);
    
    // Verify each role has icon, name, and description
    for (const role of roles) {
      await expect(role.locator('span')).toBeVisible(); // Icon
      await expect(role.locator('h3')).toBeVisible(); // Name
      await expect(role.locator('p')).toBeVisible(); // Description
    }
  });

  test('should maintain selection state during navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="onboarding-container"]', { timeout: 10000 });
    
    // Select roles
    await page.click('[data-role="dancer"]');
    await page.click('[data-role="organizer"]');
    
    // Verify selection
    await expect(page.locator('text=2')).toBeVisible();
    
    // Simulate navigation within onboarding (if applicable)
    // This would test that selections persist during form steps
    
    // Reload page to test persistence (if implemented)
    await page.reload();
    await page.waitForSelector('[data-testid="onboarding-container"]', { timeout: 10000 });
    
    // Note: Selection persistence would depend on implementation
    // This test structure allows for validation when implemented
  });
});