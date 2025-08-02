import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Helper to login
async function loginAsTestUser(page: Page, email = 'test@mundotango.life') {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`);
}

test.describe('Messaging E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should send a direct message to another user', async ({ page }) => {
    // Navigate to a user profile
    await page.goto(`${BASE_URL}/users/maria-gonzalez`);
    
    // Click message button
    await page.click('[data-testid="message-user-button"]');
    
    // Should redirect to messages with user selected
    await expect(page).toHaveURL(/\/messages\?user=/);
    
    // Type message
    await page.fill('[data-testid="message-input"]', 'Hi Maria! Would you like to practice together?');
    
    // Send message
    await page.click('[data-testid="send-message-button"]');
    
    // Verify message appears in thread
    await expect(page.locator('[data-testid="message-bubble"]:has-text("Hi Maria!")')).toBeVisible();
  });

  test('should display real-time messages', async ({ page, browser }) => {
    // Open two browser contexts
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    // Login as second user
    await loginAsTestUser(page2, 'maria@mundotango.life');
    
    // Both users navigate to messages
    await page.goto(`${BASE_URL}/messages`);
    await page2.goto(`${BASE_URL}/messages`);
    
    // User 1 sends message to User 2
    await page.click('[data-testid="new-message-button"]');
    await page.fill('[data-testid="recipient-search"]', 'Maria');
    await page.click('[data-testid="user-result"]:has-text("Maria Gonzalez")');
    await page.fill('[data-testid="message-input"]', 'Real-time test message');
    await page.click('[data-testid="send-message-button"]');
    
    // User 2 should receive message in real-time
    await expect(page2.locator('[data-testid="message-notification"]')).toBeVisible();
    await expect(page2.locator('[data-testid="unread-count"]')).toContainText('1');
    
    // Open the message
    await page2.click('[data-testid="message-thread"]:has-text("Test User")');
    await expect(page2.locator('[data-testid="message-bubble"]:has-text("Real-time test message")')).toBeVisible();
    
    await context2.close();
  });

  test('should show typing indicators', async ({ page, browser }) => {
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await loginAsTestUser(page2, 'maria@mundotango.life');
    
    // Start conversation
    await page.goto(`${BASE_URL}/messages`);
    await page.click('[data-testid="new-message-button"]');
    await page.fill('[data-testid="recipient-search"]', 'Maria');
    await page.click('[data-testid="user-result"]:has-text("Maria Gonzalez")');
    
    // User 2 opens the conversation
    await page2.goto(`${BASE_URL}/messages`);
    await page2.click('[data-testid="message-thread"]:has-text("Test User")');
    
    // User 1 starts typing
    await page.fill('[data-testid="message-input"]', 'Typing...');
    
    // User 2 should see typing indicator
    await expect(page2.locator('[data-testid="typing-indicator"]:has-text("Test User is typing")')).toBeVisible();
    
    // Clear input to stop typing
    await page.fill('[data-testid="message-input"]', '');
    
    // Typing indicator should disappear
    await expect(page2.locator('[data-testid="typing-indicator"]')).not.toBeVisible();
    
    await context2.close();
  });

  test('should search message history', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Search messages
    await page.fill('[data-testid="message-search"]', 'milonga');
    await page.press('[data-testid="message-search"]', 'Enter');
    
    // Should show search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Click on a result
    await page.click('[data-testid="search-result"]').first();
    
    // Should navigate to the message in context
    await expect(page.locator('[data-testid="highlighted-message"]')).toBeVisible();
  });

  test('should send images and files', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Start new conversation
    await page.click('[data-testid="new-message-button"]');
    await page.fill('[data-testid="recipient-search"]', 'Carlos');
    await page.click('[data-testid="user-result"]:has-text("Carlos Rodriguez")');
    
    // Send image
    const imageInput = page.locator('input[type="file"][data-testid="image-input"]');
    await imageInput.setInputFiles('./test-assets/tango-photo.jpg');
    
    // Add caption
    await page.fill('[data-testid="image-caption"]', 'Check out this tango move!');
    
    // Send
    await page.click('[data-testid="send-image-button"]');
    
    // Verify image message sent
    await expect(page.locator('[data-testid="message-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-bubble"]:has-text("Check out this tango move!")')).toBeVisible();
  });

  test('should block and unblock users', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Open conversation
    await page.click('[data-testid="message-thread"]').first();
    
    // Open conversation settings
    await page.click('[data-testid="conversation-menu"]');
    await page.click('text="Block User"');
    
    // Confirm block
    await page.click('button:has-text("Block")');
    
    // Verify blocked state
    await expect(page.locator('[data-testid="blocked-notice"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-input"]')).toBeDisabled();
    
    // Unblock user
    await page.click('[data-testid="unblock-button"]');
    
    // Verify unblocked
    await expect(page.locator('[data-testid="blocked-notice"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="message-input"]')).toBeEnabled();
  });

  test('should handle message reactions', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Open existing conversation
    await page.click('[data-testid="message-thread"]').first();
    
    // React to a message
    const message = page.locator('[data-testid="message-bubble"]').first();
    await message.hover();
    await page.click('[data-testid="react-button"]');
    
    // Select emoji
    await page.click('[data-testid="emoji-❤️"]');
    
    // Verify reaction added
    await expect(message.locator('[data-testid="reaction-❤️"]')).toBeVisible();
  });

  test('should delete messages', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Send a message first
    await page.click('[data-testid="message-thread"]').first();
    await page.fill('[data-testid="message-input"]', 'Message to delete');
    await page.click('[data-testid="send-message-button"]');
    
    // Delete the message
    const sentMessage = page.locator('[data-testid="message-bubble"]:has-text("Message to delete")');
    await sentMessage.hover();
    await page.click('[data-testid="message-menu"]');
    await page.click('text="Delete Message"');
    
    // Confirm deletion
    await page.click('button:has-text("Delete")');
    
    // Verify message removed
    await expect(sentMessage).not.toBeVisible();
    await expect(page.locator('text="Message deleted"')).toBeVisible();
  });

  test('should mark messages as read', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Check unread count
    const unreadBadge = page.locator('[data-testid="unread-badge"]').first();
    const unreadCount = await unreadBadge.textContent();
    
    // Open conversation
    await page.click('[data-testid="message-thread"]').first();
    
    // Wait for messages to be marked as read
    await page.waitForTimeout(1000);
    
    // Go back to message list
    await page.click('[data-testid="back-to-messages"]');
    
    // Verify unread count decreased
    if (unreadCount && parseInt(unreadCount) > 0) {
      await expect(unreadBadge).not.toBeVisible();
    }
  });

  test('should handle group messages', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Create group conversation
    await page.click('[data-testid="new-message-button"]');
    await page.click('[data-testid="create-group-chat"]');
    
    // Add participants
    await page.fill('[data-testid="group-name"]', 'Tango Practice Group');
    await page.fill('[data-testid="participant-search"]', 'Maria');
    await page.click('[data-testid="user-result"]:has-text("Maria Gonzalez")');
    await page.fill('[data-testid="participant-search"]', 'Carlos');
    await page.click('[data-testid="user-result"]:has-text("Carlos Rodriguez")');
    
    // Create group
    await page.click('button:has-text("Create Group")');
    
    // Send message to group
    await page.fill('[data-testid="message-input"]', 'Welcome to our practice group!');
    await page.click('[data-testid="send-message-button"]');
    
    // Verify group message sent
    await expect(page.locator('[data-testid="group-header"]:has-text("Tango Practice Group")')).toBeVisible();
    await expect(page.locator('[data-testid="message-bubble"]:has-text("Welcome to our practice group!")')).toBeVisible();
  });

  test('should mute conversation notifications', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Open conversation
    await page.click('[data-testid="message-thread"]').first();
    
    // Mute notifications
    await page.click('[data-testid="conversation-menu"]');
    await page.click('text="Mute Notifications"');
    
    // Select duration
    await page.click('[data-testid="mute-1-hour"]');
    
    // Verify muted
    await expect(page.locator('[data-testid="muted-icon"]')).toBeVisible();
    
    // Unmute
    await page.click('[data-testid="conversation-menu"]');
    await page.click('text="Unmute Notifications"');
    
    // Verify unmuted
    await expect(page.locator('[data-testid="muted-icon"]')).not.toBeVisible();
  });

  test('should handle voice messages', async ({ page, context }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone']);
    
    await page.goto(`${BASE_URL}/messages`);
    await page.click('[data-testid="message-thread"]').first();
    
    // Start recording
    await page.click('[data-testid="voice-message-button"]');
    
    // Verify recording indicator
    await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible();
    
    // Stop recording after 2 seconds
    await page.waitForTimeout(2000);
    await page.click('[data-testid="stop-recording-button"]');
    
    // Send voice message
    await page.click('[data-testid="send-voice-button"]');
    
    // Verify voice message sent
    await expect(page.locator('[data-testid="voice-message-player"]')).toBeVisible();
  });

  test('should export conversation history', async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    
    // Open conversation
    await page.click('[data-testid="message-thread"]').first();
    
    // Export conversation
    await page.click('[data-testid="conversation-menu"]');
    await page.click('text="Export Conversation"');
    
    // Select format
    await page.click('[data-testid="export-pdf"]');
    
    // Download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download")')
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});