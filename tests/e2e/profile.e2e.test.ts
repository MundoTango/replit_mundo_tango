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

test.describe('Profile E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should view own profile', async ({ page }) => {
    // Navigate to profile
    await page.click('[data-testid="user-menu"]');
    await page.click('text="My Profile"');
    
    // Verify profile page loaded
    await expect(page).toHaveURL(`${BASE_URL}/profile`);
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-bio"]')).toBeVisible();
  });

  test('should edit profile information', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    
    // Click edit button
    await page.click('[data-testid="edit-profile-button"]');
    
    // Update profile fields
    await page.fill('[name="bio"]', 'Passionate tango dancer with 5 years of experience');
    await page.fill('[name="city"]', 'Buenos Aires');
    await page.click('[name="country"]');
    await page.click('text="Argentina"');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify updates
    await expect(page.locator('[data-testid="profile-bio"]')).toContainText('Passionate tango dancer');
    await expect(page.locator('[data-testid="profile-location"]')).toContainText('Buenos Aires, Argentina');
  });

  test('should update profile photo', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.click('[data-testid="edit-profile-button"]');
    
    // Upload new photo
    const fileInput = page.locator('input[type="file"][name="profilePhoto"]');
    await fileInput.setInputFiles('./test-assets/profile-photo.jpg');
    
    // Crop and save
    await page.click('[data-testid="crop-confirm"]');
    
    // Save profile
    await page.click('button:has-text("Save Changes")');
    
    // Verify photo updated
    await expect(page.locator('[data-testid="profile-photo-updated"]')).toBeVisible();
  });

  test('should update tango preferences', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.click('[data-testid="edit-profile-button"]');
    
    // Navigate to tango tab
    await page.click('[data-testid="tango-preferences-tab"]');
    
    // Update dance roles
    await page.check('[data-testid="role-leader"]');
    await page.uncheck('[data-testid="role-follower"]');
    
    // Update experience level
    await page.click('[name="experienceLevel"]');
    await page.click('text="Advanced"');
    
    // Update dance styles
    await page.check('[data-testid="style-salon"]');
    await page.check('[data-testid="style-nuevo"]');
    
    // Save
    await page.click('button:has-text("Save Changes")');
    
    // Verify updates
    await expect(page.locator('[data-testid="profile-roles"]')).toContainText('Leader');
    await expect(page.locator('[data-testid="profile-level"]')).toContainText('Advanced');
  });

  test('should add social media links', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.click('[data-testid="edit-profile-button"]');
    
    // Navigate to social links tab
    await page.click('[data-testid="social-links-tab"]');
    
    // Add Instagram
    await page.fill('[name="instagram"]', '@mytangoaccount');
    
    // Add YouTube
    await page.fill('[name="youtube"]', 'youtube.com/mytangochannel');
    
    // Save
    await page.click('button:has-text("Save Changes")');
    
    // Verify links appear on profile
    await expect(page.locator('[data-testid="social-instagram"]')).toBeVisible();
    await expect(page.locator('[data-testid="social-youtube"]')).toBeVisible();
  });

  test('should view another user profile', async ({ page }) => {
    // Search for user
    await page.fill('[data-testid="global-search"]', 'Maria Gonzalez');
    await page.press('[data-testid="global-search"]', 'Enter');
    
    // Click on user result
    await page.click('[data-testid="search-result-user"]:has-text("Maria Gonzalez")');
    
    // Verify on user profile
    await expect(page).toHaveURL(/\/users\/maria-gonzalez/);
    await expect(page.locator('[data-testid="profile-name"]')).toContainText('Maria Gonzalez');
    
    // Should see action buttons
    await expect(page.locator('[data-testid="add-friend-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-user-button"]')).toBeVisible();
  });

  test('should send friend request', async ({ page }) => {
    await page.goto(`${BASE_URL}/users/carlos-rodriguez`);
    
    // Send friend request
    await page.click('[data-testid="add-friend-button"]');
    
    // Add message
    await page.fill('[data-testid="friend-request-message"]', "Hi Carlos! Let's connect and dance together!");
    
    // Send request
    await page.click('button:has-text("Send Request")');
    
    // Verify request sent
    await expect(page.locator('[data-testid="friend-request-sent"]')).toBeVisible();
    await expect(page.locator('text="Request Pending"')).toBeVisible();
  });

  test('should update privacy settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/privacy`);
    
    // Update profile visibility
    await page.click('[name="profileVisibility"]');
    await page.click('text="Friends Only"');
    
    // Update contact preferences
    await page.uncheck('[data-testid="show-email"]');
    await page.check('[data-testid="show-phone"]');
    
    // Update message settings
    await page.click('[name="messagePermissions"]');
    await page.click('text="Friends Only"');
    
    // Save
    await page.click('button:has-text("Save Privacy Settings")');
    
    // Verify saved
    await expect(page.locator('text="Privacy settings updated"')).toBeVisible();
  });

  test('should view and manage followers', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    
    // Click followers count
    await page.click('[data-testid="followers-count"]');
    
    // Should show followers modal
    await expect(page.locator('[data-testid="followers-modal"]')).toBeVisible();
    
    // Search followers
    await page.fill('[data-testid="followers-search"]', 'Ana');
    
    // Remove a follower
    const follower = page.locator('[data-testid="follower-item"]:has-text("Ana Silva")');
    await follower.locator('[data-testid="remove-follower"]').click();
    
    // Confirm
    await page.click('button:has-text("Remove")');
    
    // Verify removed
    await expect(follower).not.toBeVisible();
  });

  test('should showcase tango achievements', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.click('[data-testid="edit-profile-button"]');
    
    // Navigate to achievements tab
    await page.click('[data-testid="achievements-tab"]');
    
    // Add achievement
    await page.click('[data-testid="add-achievement"]');
    await page.fill('[name="achievementTitle"]', 'Buenos Aires Tango Championship');
    await page.fill('[name="achievementYear"]', '2024');
    await page.fill('[name="achievementDescription"]', 'Finalist in salon tango category');
    
    // Save
    await page.click('button:has-text("Add Achievement")');
    await page.click('button:has-text("Save Changes")');
    
    // Verify on profile
    await expect(page.locator('[data-testid="achievement-item"]')).toContainText('Buenos Aires Tango Championship');
  });

  test('should create and manage dance partnerships', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    
    // Add dance partner
    await page.click('[data-testid="add-partner-button"]');
    
    // Search for partner
    await page.fill('[data-testid="partner-search"]', 'Maria Gonzalez');
    await page.click('[data-testid="partner-result"]:has-text("Maria Gonzalez")');
    
    // Add partnership details
    await page.fill('[name="partnershipDuration"]', '2 years');
    await page.check('[data-testid="current-partner"]');
    
    // Send partnership request
    await page.click('button:has-text("Send Partnership Request")');
    
    // Verify request sent
    await expect(page.locator('text="Partnership request sent"')).toBeVisible();
  });

  test('should export profile data', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/account`);
    
    // Request data export
    await page.click('[data-testid="export-data-button"]');
    
    // Select format
    await page.click('[data-testid="export-format-json"]');
    
    // Confirm export
    await page.click('button:has-text("Export My Data")');
    
    // Should receive email notification
    await expect(page.locator('text="Data export requested. You will receive an email when ready."')).toBeVisible();
  });

  test('should view profile statistics', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    
    // Click on stats tab
    await page.click('[data-testid="profile-stats-tab"]');
    
    // Verify statistics displayed
    await expect(page.locator('[data-testid="stat-posts-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-events-attended"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-dance-hours"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-member-since"]')).toBeVisible();
    
    // View detailed stats
    await page.click('[data-testid="view-detailed-stats"]');
    
    // Should show charts and graphs
    await expect(page.locator('[data-testid="activity-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="dance-style-breakdown"]')).toBeVisible();
  });

  test('should handle profile verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/verification`);
    
    // Start verification process
    await page.click('[data-testid="start-verification"]');
    
    // Upload ID document
    const idInput = page.locator('input[type="file"][name="idDocument"]');
    await idInput.setInputFiles('./test-assets/id-document.jpg');
    
    // Add professional info
    await page.fill('[name="professionalTitle"]', 'Professional Tango Instructor');
    await page.fill('[name="yearsTeaching"]', '10');
    
    // Submit verification
    await page.click('button:has-text("Submit for Verification")');
    
    // Should show pending status
    await expect(page.locator('[data-testid="verification-pending"]')).toBeVisible();
    await expect(page.locator('text="Verification under review"')).toBeVisible();
  });
});