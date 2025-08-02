import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Helper to login as admin
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[name="email"]', 'admin@mundotango.life');
  await page.fill('[name="password"]', 'AdminPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`);
}

test.describe('Admin E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should access admin dashboard', async ({ page }) => {
    // Navigate to admin
    await page.click('[data-testid="user-menu"]');
    await page.click('text="Admin Dashboard"');
    
    // Verify admin dashboard loaded
    await expect(page).toHaveURL(`${BASE_URL}/admin`);
    await expect(page.locator('h1:has-text("Admin Dashboard")')).toBeVisible();
    
    // Check main sections
    await expect(page.locator('[data-testid="admin-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-quick-actions"]')).toBeVisible();
  });

  test('should view platform statistics', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    
    // Check statistics cards
    await expect(page.locator('[data-testid="stat-total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-active-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-total-events"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-revenue"]')).toBeVisible();
    
    // View detailed analytics
    await page.click('[data-testid="view-analytics"]');
    
    // Should show charts
    await expect(page.locator('[data-testid="user-growth-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="engagement-chart"]')).toBeVisible();
  });

  test('should manage users', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/users`);
    
    // Search for user
    await page.fill('[data-testid="user-search"]', 'maria');
    await page.press('[data-testid="user-search"]', 'Enter');
    
    // Click on user
    const userRow = page.locator('[data-testid="user-row"]:has-text("Maria Gonzalez")');
    await userRow.click();
    
    // View user details
    await expect(page.locator('[data-testid="user-details-modal"]')).toBeVisible();
    
    // Verify user
    await page.click('[data-testid="verify-user-button"]');
    await page.fill('[data-testid="verification-note"]', 'Verified as professional instructor');
    await page.click('button:has-text("Confirm Verification")');
    
    // Should show verified badge
    await expect(page.locator('[data-testid="verified-badge"]')).toBeVisible();
  });

  test('should moderate content', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/moderation`);
    
    // View reported content
    await expect(page.locator('[data-testid="reported-items-list"]')).toBeVisible();
    
    // Open first report
    const firstReport = page.locator('[data-testid="report-item"]').first();
    await firstReport.click();
    
    // Review content
    await expect(page.locator('[data-testid="reported-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="report-reason"]')).toBeVisible();
    
    // Take action
    await page.click('[data-testid="remove-content-button"]');
    await page.fill('[data-testid="removal-reason"]', 'Violates community guidelines');
    await page.click('button:has-text("Remove Content")');
    
    // Verify removed
    await expect(page.locator('text="Content removed successfully"')).toBeVisible();
  });

  test('should manage events', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/events`);
    
    // Filter by pending approval
    await page.click('[data-testid="filter-pending"]');
    
    // Approve event
    const pendingEvent = page.locator('[data-testid="event-row"][data-status="pending"]').first();
    await pendingEvent.locator('[data-testid="approve-button"]').click();
    
    // Add featured tag
    await page.check('[data-testid="feature-event"]');
    await page.click('button:has-text("Approve Event")');
    
    // Verify approved
    await expect(page.locator('text="Event approved"')).toBeVisible();
  });

  test('should handle user bans', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/users`);
    
    // Find problematic user
    await page.fill('[data-testid="user-search"]', 'spammer');
    await page.press('[data-testid="user-search"]', 'Enter');
    
    // Select user
    const userRow = page.locator('[data-testid="user-row"]').first();
    await userRow.click();
    
    // Ban user
    await page.click('[data-testid="ban-user-button"]');
    
    // Fill ban details
    await page.fill('[data-testid="ban-reason"]', 'Repeated spam violations');
    await page.click('[data-testid="ban-duration"]');
    await page.click('text="30 days"');
    
    // Confirm ban
    await page.click('button:has-text("Ban User")');
    
    // Verify banned
    await expect(page.locator('[data-testid="banned-badge"]')).toBeVisible();
  });

  test('should manage platform settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/settings`);
    
    // Update registration settings
    await page.click('[data-testid="registration-tab"]');
    await page.check('[data-testid="require-email-verification"]');
    await page.check('[data-testid="manual-approval-mode"]');
    
    // Save settings
    await page.click('button:has-text("Save Registration Settings")');
    
    // Verify saved
    await expect(page.locator('text="Settings updated successfully"')).toBeVisible();
  });

  test('should export platform data', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/reports`);
    
    // Generate user report
    await page.click('[data-testid="generate-user-report"]');
    
    // Set date range
    await page.fill('[data-testid="report-start-date"]', '2025-08-01');
    await page.fill('[data-testid="report-end-date"]', '2025-08-31');
    
    // Select fields
    await page.check('[data-testid="include-demographics"]');
    await page.check('[data-testid="include-activity"]');
    
    // Generate report
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Generate Report")')
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toContain('user-report');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should send platform announcements', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/communications`);
    
    // Create announcement
    await page.click('[data-testid="new-announcement"]');
    
    // Fill announcement details
    await page.fill('[data-testid="announcement-title"]', 'Platform Maintenance');
    await page.fill('[data-testid="announcement-message"]', 'The platform will undergo maintenance on Sept 1st from 2-4 AM.');
    
    // Set target audience
    await page.click('[data-testid="target-audience"]');
    await page.click('text="All Users"');
    
    // Schedule announcement
    await page.click('[data-testid="schedule-announcement"]');
    await page.fill('[data-testid="schedule-date"]', '2025-08-31');
    await page.fill('[data-testid="schedule-time"]', '20:00');
    
    // Send
    await page.click('button:has-text("Schedule Announcement")');
    
    // Verify scheduled
    await expect(page.locator('text="Announcement scheduled"')).toBeVisible();
  });

  test('should manage payment settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/payments`);
    
    // View payment stats
    await expect(page.locator('[data-testid="revenue-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-subscriptions"]')).toBeVisible();
    
    // Configure payment settings
    await page.click('[data-testid="payment-settings-tab"]');
    
    // Update commission rate
    await page.fill('[data-testid="platform-commission"]', '15');
    
    // Add payment method
    await page.click('[data-testid="add-payment-method"]');
    await page.check('[data-testid="enable-mercadopago"]');
    
    // Save
    await page.click('button:has-text("Save Payment Settings")');
    
    // Verify saved
    await expect(page.locator('text="Payment settings updated"')).toBeVisible();
  });

  test('should review platform security', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/security`);
    
    // Check security status
    await expect(page.locator('[data-testid="security-score"]')).toBeVisible();
    
    // View recent threats
    await page.click('[data-testid="view-threats"]');
    await expect(page.locator('[data-testid="threat-list"]')).toBeVisible();
    
    // Run security scan
    await page.click('[data-testid="run-security-scan"]');
    
    // Wait for scan
    await page.waitForSelector('[data-testid="scan-complete"]', { timeout: 30000 });
    
    // View results
    await expect(page.locator('[data-testid="scan-results"]')).toBeVisible();
  });

  test('should manage feature flags', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/features`);
    
    // Toggle feature flag
    const aiFeature = page.locator('[data-testid="feature-ai-recommendations"]');
    await aiFeature.locator('[data-testid="toggle-feature"]').click();
    
    // Set rollout percentage
    await page.fill('[data-testid="rollout-percentage"]', '25');
    
    // Add user group
    await page.click('[data-testid="add-test-group"]');
    await page.fill('[data-testid="group-name"]', 'beta-testers');
    
    // Save
    await page.click('button:has-text("Save Feature Settings")');
    
    // Verify saved
    await expect(page.locator('text="Feature flags updated"')).toBeVisible();
  });

  test('should monitor system health', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/system`);
    
    // Check system status
    await expect(page.locator('[data-testid="system-status"]')).toContainText(/Operational|Degraded|Down/);
    
    // View service health
    const services = ['Database', 'Redis', 'Storage', 'Email'];
    for (const service of services) {
      await expect(page.locator(`[data-testid="service-${service.toLowerCase()}"]`)).toBeVisible();
    }
    
    // Check error logs
    await page.click('[data-testid="view-error-logs"]');
    await expect(page.locator('[data-testid="error-log-list"]')).toBeVisible();
  });

  test('should create admin reports', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/reports`);
    
    // Create custom report
    await page.click('[data-testid="create-custom-report"]');
    
    // Configure report
    await page.fill('[data-testid="report-name"]', 'Monthly Activity Report');
    await page.click('[data-testid="report-type"]');
    await page.click('text="Activity Analytics"');
    
    // Add metrics
    await page.check('[data-testid="metric-user-signups"]');
    await page.check('[data-testid="metric-event-creation"]');
    await page.check('[data-testid="metric-post-engagement"]');
    
    // Set schedule
    await page.click('[data-testid="report-frequency"]');
    await page.click('text="Monthly"');
    
    // Save report
    await page.click('button:has-text("Create Report")');
    
    // Verify created
    await expect(page.locator('text="Report created successfully"')).toBeVisible();
  });
});