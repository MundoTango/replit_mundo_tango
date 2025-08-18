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

test.describe('Groups E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should automatically join city group based on location', async ({ page }) => {
    // Navigate to groups
    await page.goto(`${BASE_URL}/groups`);
    
    // Check if automatically joined Buenos Aires group
    const myGroups = page.locator('[data-testid="my-groups-section"]');
    await expect(myGroups).toContainText('Buenos Aires Tango Community');
    
    // Verify auto-join badge
    const groupCard = page.locator('[data-testid="group-card"]:has-text("Buenos Aires")');
    await expect(groupCard.locator('[data-testid="auto-joined-badge"]')).toBeVisible();
  });

  test('should browse and join interest groups', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups`);
    
    // Switch to browse tab
    await page.click('[data-testid="browse-groups-tab"]');
    
    // Filter by category
    await page.click('[data-testid="category-filter"]');
    await page.click('text="Professional"');
    
    // Find and join a group
    const teachersGroup = page.locator('[data-testid="group-card"]:has-text("Tango Teachers Network")');
    await teachersGroup.locator('button:has-text("Join")').click();
    
    // Confirm join
    await page.click('button:has-text("Confirm")');
    
    // Verify joined
    await expect(teachersGroup.locator('button:has-text("Joined")')).toBeVisible();
    
    // Should appear in my groups
    await page.click('[data-testid="my-groups-tab"]');
    await expect(page.locator('text="Tango Teachers Network"')).toBeVisible();
  });

  test('should create a new group', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups`);
    
    // Click create group
    await page.click('[data-testid="create-group-button"]');
    
    // Fill group details
    await page.fill('[name="groupName"]', 'Test Tango Practice Group');
    await page.fill('[name="description"]', 'A group for testing E2E functionality');
    
    // Select category
    await page.click('[name="category"]');
    await page.click('text="Practice"');
    
    // Set privacy
    await page.click('[data-testid="privacy-public"]');
    
    // Add rules
    await page.click('[data-testid="add-rule-button"]');
    await page.fill('[data-testid="rule-input-0"]', 'Be respectful to all members');
    
    // Upload cover image
    const fileInput = page.locator('input[type="file"][name="coverImage"]');
    await fileInput.setInputFiles('./test-assets/group-cover.jpg');
    
    // Create group
    await page.click('button:has-text("Create Group")');
    
    // Should redirect to new group page
    await expect(page).toHaveURL(/\/groups\/\d+/);
    await expect(page.locator('h1')).toContainText('Test Tango Practice Group');
  });

  test('should post in group', async ({ page }) => {
    // Navigate to a joined group
    await page.goto(`${BASE_URL}/groups`);
    const firstGroup = page.locator('[data-testid="group-card"]').first();
    await firstGroup.click();
    
    // Create post
    await page.fill('[data-testid="group-post-composer"]', 'Hello group members! Looking forward to dancing with you all.');
    await page.click('button:has-text("Post to Group")');
    
    // Verify post appears
    await expect(page.locator('[data-testid="group-post"]:has-text("Hello group members!")')).toBeVisible();
  });

  test('should manage group as admin', async ({ page }) => {
    // Create a group first
    await page.goto(`${BASE_URL}/groups`);
    await page.click('[data-testid="create-group-button"]');
    await page.fill('[name="groupName"]', 'Admin Test Group');
    await page.fill('[name="description"]', 'Testing admin features');
    await page.click('[name="category"]');
    await page.click('text="Social"');
    await page.click('button:has-text("Create Group")');
    
    // Wait for redirect to group page
    await page.waitForURL(/\/groups\/\d+/);
    
    // Access admin panel
    await page.click('[data-testid="group-settings-button"]');
    await page.click('text="Manage Group"');
    
    // Edit group details
    await page.fill('[name="description"]', 'Updated description for admin test');
    await page.click('button:has-text("Save Changes")');
    
    // Verify update
    await expect(page.locator('text="Group updated successfully"')).toBeVisible();
  });

  test('should invite members to group', async ({ page }) => {
    // Navigate to a group where user is admin
    await page.goto(`${BASE_URL}/groups/1`); // Assuming group 1 exists
    
    // Click invite button
    await page.click('[data-testid="invite-members-button"]');
    
    // Enter email addresses
    await page.fill('[data-testid="invite-emails"]', 'friend1@example.com, friend2@example.com');
    
    // Add personal message
    await page.fill('[data-testid="invite-message"]', 'Join our amazing tango group!');
    
    // Send invites
    await page.click('button:has-text("Send Invitations")');
    
    // Verify success
    await expect(page.locator('text="2 invitations sent"')).toBeVisible();
  });

  test('should search within group posts', async ({ page }) => {
    // Navigate to active group
    await page.goto(`${BASE_URL}/groups/1`);
    
    // Use search
    await page.fill('[data-testid="group-search"]', 'milonga');
    await page.press('[data-testid="group-search"]', 'Enter');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="search-results-count"]')).toBeVisible();
    
    // All visible posts should contain search term
    const posts = page.locator('[data-testid="group-post"]');
    const count = await posts.count();
    for (let i = 0; i < count; i++) {
      await expect(posts.nth(i)).toContainText(/milonga/i);
    }
  });

  test('should handle group events', async ({ page }) => {
    // Navigate to group
    await page.goto(`${BASE_URL}/groups/1`);
    
    // Switch to events tab
    await page.click('[data-testid="group-events-tab"]');
    
    // Create event
    await page.click('[data-testid="create-group-event"]');
    
    // Fill event details
    await page.fill('[name="eventTitle"]', 'Group Practice Session');
    await page.fill('[name="eventDate"]', '2025-09-15');
    await page.fill('[name="eventTime"]', '19:00');
    await page.fill('[name="location"]', 'Community Center Room A');
    await page.fill('[name="description"]', 'Weekly practice session for group members');
    
    // Create event
    await page.click('button:has-text("Create Event")');
    
    // Verify event appears
    await expect(page.locator('[data-testid="group-event"]:has-text("Group Practice Session")')).toBeVisible();
  });

  test('should view group members and roles', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups/1`);
    
    // Navigate to members tab
    await page.click('[data-testid="group-members-tab"]');
    
    // Verify member list
    await expect(page.locator('[data-testid="members-count"]')).toBeVisible();
    
    // Filter by role
    await page.click('[data-testid="role-filter"]');
    await page.click('text="Admins"');
    
    // Should show only admins
    const adminBadges = page.locator('[data-testid="admin-badge"]');
    const adminCount = await adminBadges.count();
    expect(adminCount).toBeGreaterThan(0);
  });

  test('should leave a group', async ({ page }) => {
    // Join a group first
    await page.goto(`${BASE_URL}/groups`);
    await page.click('[data-testid="browse-groups-tab"]');
    
    const groupToJoin = page.locator('[data-testid="group-card"]:has-text("Beginner Friendly")').first();
    await groupToJoin.locator('button:has-text("Join")').click();
    await page.click('button:has-text("Confirm")');
    
    // Navigate to the group
    await groupToJoin.click();
    
    // Leave group
    await page.click('[data-testid="group-settings-button"]');
    await page.click('text="Leave Group"');
    
    // Confirm
    await page.click('button:has-text("Yes, Leave")');
    
    // Should redirect to groups list
    await expect(page).toHaveURL(`${BASE_URL}/groups`);
    
    // Group should not be in my groups
    await page.click('[data-testid="my-groups-tab"]');
    await expect(page.locator('text="Beginner Friendly"')).not.toBeVisible();
  });

  test('should report inappropriate group content', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups/1`);
    
    // Find a post
    const post = page.locator('[data-testid="group-post"]').first();
    
    // Report post
    await post.locator('[data-testid="post-menu"]').click();
    await page.click('text="Report"');
    
    // Select reason
    await page.click('[data-testid="report-spam"]');
    await page.fill('[data-testid="report-details"]', 'This is spam content');
    
    // Submit report
    await page.click('button:has-text("Submit Report")');
    
    // Verify success
    await expect(page.locator('text="Report submitted"')).toBeVisible();
  });

  test('should handle group notifications', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups/1`);
    
    // Access notification settings
    await page.click('[data-testid="group-settings-button"]');
    await page.click('text="Notification Settings"');
    
    // Configure notifications
    await page.uncheck('[data-testid="notify-all-posts"]');
    await page.check('[data-testid="notify-mentions-only"]');
    await page.check('[data-testid="notify-events"]');
    
    // Save settings
    await page.click('button:has-text("Save Preferences")');
    
    // Verify saved
    await expect(page.locator('text="Notification preferences updated"')).toBeVisible();
  });

  test('should pin important posts as admin', async ({ page }) => {
    // Navigate to admin group
    await page.goto(`${BASE_URL}/groups/1`); // Assuming user is admin
    
    // Find a post to pin
    const importantPost = page.locator('[data-testid="group-post"]').first();
    
    // Pin post
    await importantPost.locator('[data-testid="post-menu"]').click();
    await page.click('text="Pin Post"');
    
    // Verify pinned
    await expect(importantPost.locator('[data-testid="pinned-badge"]')).toBeVisible();
    
    // Should appear at top
    const firstPost = page.locator('[data-testid="group-post"]').first();
    await expect(firstPost).toHaveAttribute('data-pinned', 'true');
  });

  test('should search and filter groups', async ({ page }) => {
    await page.goto(`${BASE_URL}/groups`);
    await page.click('[data-testid="browse-groups-tab"]');
    
    // Search by name
    await page.fill('[data-testid="groups-search"]', 'Buenos Aires');
    
    // Apply filters
    await page.click('[data-testid="filter-button"]');
    await page.click('[data-testid="filter-city"]');
    await page.click('text="Buenos Aires"');
    await page.click('[data-testid="filter-size"]');
    await page.click('text="Large (500+)"');
    await page.click('button:has-text("Apply Filters")');
    
    // Verify results
    const results = page.locator('[data-testid="group-card"]');
    const count = await results.count();
    
    for (let i = 0; i < count; i++) {
      const group = results.nth(i);
      await expect(group).toContainText('Buenos Aires');
      const memberCount = await group.locator('[data-testid="member-count"]').textContent();
      expect(parseInt(memberCount!)).toBeGreaterThan(500);
    }
  });
});