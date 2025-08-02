import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test user credentials
const TEST_USER = {
  email: 'test@mundotango.life',
  password: 'TestPassword123!',
  name: 'E2E Test User'
};

// Helper functions
async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`);
}

async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL(`${BASE_URL}/login`);
}

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should register a new user', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Sign Up');
    await page.waitForURL(`${BASE_URL}/register`);

    // Fill registration form
    await page.fill('[name="name"]', TEST_USER.name);
    await page.fill('[name="email"]', `${Date.now()}_${TEST_USER.email}`);
    await page.fill('[name="password"]', TEST_USER.password);
    await page.fill('[name="confirmPassword"]', TEST_USER.password);
    
    // Accept terms
    await page.check('[name="acceptTerms"]');
    
    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to onboarding or home
    await expect(page).toHaveURL(/\/(onboarding|home)/);
    
    // Should show welcome message
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Verify successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator(`text=${TEST_USER.name}`)).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    
    // Should remain on login page
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Then logout
    await logout(page);
    
    // Should be redirected to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    // User menu should not be visible
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access protected route
    await page.goto(`${BASE_URL}/profile`);
    
    // Should be redirected to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    
    // Should show message
    await expect(page.locator('text=Please login to continue')).toBeVisible();
  });

  test('should remember user after page refresh', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Refresh page
    await page.reload();
    
    // User should still be logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('text=Forgot password?');
    
    // Should navigate to reset page
    await expect(page).toHaveURL(`${BASE_URL}/reset-password`);
    
    // Enter email
    await page.fill('[name="email"]', TEST_USER.email);
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Reset link sent')).toBeVisible();
  });

  test('should enforce password requirements', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Try weak password
    await page.fill('[name="password"]', 'weak');
    await page.fill('[name="confirmPassword"]', 'weak');
    
    // Should show password requirements
    await expect(page.locator('text=at least 8 characters')).toBeVisible();
    await expect(page.locator('text=one uppercase letter')).toBeVisible();
    await expect(page.locator('text=one number')).toBeVisible();
  });

  test('should handle session expiration', async ({ page, context }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Clear cookies to simulate session expiration
    await context.clearCookies();
    
    // Try to navigate to protected page
    await page.goto(`${BASE_URL}/profile`);
    
    // Should redirect to login
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.locator('text=Session expired')).toBeVisible();
  });

  test('should handle concurrent sessions', async ({ page, browser }) => {
    // Login in first browser
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Open second browser and login
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await login(page2, TEST_USER.email, TEST_USER.password);
    
    // Both sessions should be active
    await page.reload();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    await page2.reload();
    await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible();
    
    await context2.close();
  });

  test('should handle social login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Click Google login
    await page.click('[data-testid="google-login"]');
    
    // Should open Google OAuth popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="google-login"]')
    ]);
    
    // Verify popup URL contains Google OAuth
    expect(popup.url()).toContain('accounts.google.com');
    
    await popup.close();
  });

  test('should enforce rate limiting on login attempts', async ({ page }) => {
    const invalidEmail = 'invalid@example.com';
    const invalidPassword = 'wrongpassword';
    
    // Try multiple failed login attempts
    for (let i = 0; i < 6; i++) {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('[name="email"]', invalidEmail);
      await page.fill('[name="password"]', invalidPassword);
      await page.click('button[type="submit"]');
      
      if (i < 5) {
        await expect(page.locator('text=Invalid email or password')).toBeVisible();
      }
    }
    
    // After 5 attempts, should show rate limit message
    await expect(page.locator('text=Too many attempts')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Invalid email formats
    const invalidEmails = ['notanemail', 'missing@', '@nodomain.com', 'spaces in@email.com'];
    
    for (const email of invalidEmails) {
      await page.fill('[name="email"]', email);
      await page.press('[name="email"]', 'Tab'); // Trigger validation
      
      await expect(page.locator('text=Please enter a valid email')).toBeVisible();
    }
  });

  test('should handle account activation', async ({ page }) => {
    // Simulate clicking activation link
    const activationToken = 'test-activation-token';
    await page.goto(`${BASE_URL}/activate?token=${activationToken}`);
    
    // Should show activation status
    await expect(page.locator('text=Account activated')).toBeVisible();
    
    // Should redirect to login
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('should update user profile after login', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Navigate to profile
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Profile');
    
    // Update profile
    const newBio = 'Updated bio from E2E test';
    await page.fill('[name="bio"]', newBio);
    await page.click('button:has-text("Save")');
    
    // Should show success message
    await expect(page.locator('text=Profile updated')).toBeVisible();
    
    // Refresh and verify persistence
    await page.reload();
    await expect(page.locator('[name="bio"]')).toHaveValue(newBio);
  });
});