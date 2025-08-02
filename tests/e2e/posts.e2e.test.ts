import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test data
const TEST_POST = {
  content: 'Amazing milonga last night at Salon Canning! #tango #buenosaires',
  updatedContent: 'Updated: Amazing milonga last night! The orchestra was fantastic!'
};

// Helper to login
async function loginAsTestUser(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[name="email"]', 'test@mundotango.life');
  await page.fill('[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`);
}

test.describe('Posts E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should create a new text post', async ({ page }) => {
    // Click create post button
    await page.click('[data-testid="create-post-button"]');
    
    // Type post content
    await page.fill('[data-testid="post-composer"]', TEST_POST.content);
    
    // Submit post
    await page.click('button:has-text("Post")');
    
    // Wait for post to appear in feed
    await page.waitForSelector(`text="${TEST_POST.content}"`);
    
    // Verify post appears with correct content
    const post = page.locator('[data-testid="post-item"]').first();
    await expect(post).toContainText(TEST_POST.content);
    await expect(post).toContainText('#tango');
    await expect(post).toContainText('#buenosaires');
  });

  test('should create a post with image', async ({ page }) => {
    await page.click('[data-testid="create-post-button"]');
    
    // Add text
    await page.fill('[data-testid="post-composer"]', 'Check out this tango photo!');
    
    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/tango-photo.jpg');
    
    // Wait for image preview
    await page.waitForSelector('[data-testid="image-preview"]');
    
    // Submit post
    await page.click('button:has-text("Post")');
    
    // Verify post with image appears
    await page.waitForSelector('[data-testid="post-item"]:has-text("Check out this tango photo!")');
    const post = page.locator('[data-testid="post-item"]').first();
    await expect(post.locator('img[alt="Post image"]')).toBeVisible();
  });

  test('should like and unlike a post', async ({ page }) => {
    // Create a post first
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-composer"]', 'Test post for likes');
    await page.click('button:has-text("Post")');
    await page.waitForSelector('text="Test post for likes"');
    
    const post = page.locator('[data-testid="post-item"]:has-text("Test post for likes")');
    const likeButton = post.locator('[data-testid="like-button"]');
    const likeCount = post.locator('[data-testid="like-count"]');
    
    // Initial state
    await expect(likeCount).toHaveText('0');
    
    // Like the post
    await likeButton.click();
    await expect(likeCount).toHaveText('1');
    await expect(likeButton).toHaveAttribute('data-liked', 'true');
    
    // Unlike the post
    await likeButton.click();
    await expect(likeCount).toHaveText('0');
    await expect(likeButton).toHaveAttribute('data-liked', 'false');
  });

  test('should add and view comments', async ({ page }) => {
    // Create a post
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-composer"]', 'Post for commenting test');
    await page.click('button:has-text("Post")');
    await page.waitForSelector('text="Post for commenting test"');
    
    const post = page.locator('[data-testid="post-item"]:has-text("Post for commenting test")');
    
    // Click comment button
    await post.locator('[data-testid="comment-button"]').click();
    
    // Add comment
    const commentInput = post.locator('[data-testid="comment-input"]');
    await commentInput.fill('Great post! Love the energy');
    await commentInput.press('Enter');
    
    // Verify comment appears
    await expect(post.locator('text="Great post! Love the energy"')).toBeVisible();
    
    // Verify comment count
    await expect(post.locator('[data-testid="comment-count"]')).toHaveText('1');
  });

  test('should edit own post', async ({ page }) => {
    // Create a post
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-composer"]', TEST_POST.content);
    await page.click('button:has-text("Post")');
    await page.waitForSelector(`text="${TEST_POST.content}"`);
    
    const post = page.locator('[data-testid="post-item"]:has-text("' + TEST_POST.content + '")');
    
    // Open post menu
    await post.locator('[data-testid="post-menu"]').click();
    await page.click('text="Edit"');
    
    // Edit content
    const editTextarea = page.locator('[data-testid="post-edit-textarea"]');
    await editTextarea.fill(TEST_POST.updatedContent);
    await page.click('button:has-text("Save")');
    
    // Verify updated content
    await expect(post).toContainText(TEST_POST.updatedContent);
    await expect(post).toContainText('(edited)');
  });

  test('should delete own post', async ({ page }) => {
    // Create a post
    const uniqueContent = `Delete test post ${Date.now()}`;
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-composer"]', uniqueContent);
    await page.click('button:has-text("Post")');
    await page.waitForSelector(`text="${uniqueContent}"`);
    
    const post = page.locator(`[data-testid="post-item"]:has-text("${uniqueContent}")`);
    
    // Open post menu and delete
    await post.locator('[data-testid="post-menu"]').click();
    await page.click('text="Delete"');
    
    // Confirm deletion
    await page.click('button:has-text("Delete"):visible');
    
    // Verify post is removed
    await expect(page.locator(`text="${uniqueContent}"`)).not.toBeVisible();
  });

  test('should share a post', async ({ page, context }) => {
    // Create a post
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-composer"]', 'Post to share');
    await page.click('button:has-text("Post")');
    await page.waitForSelector('text="Post to share"');
    
    const post = page.locator('[data-testid="post-item"]:has-text("Post to share")');
    
    // Click share button
    await post.locator('[data-testid="share-button"]').click();
    
    // Copy link option
    await page.click('text="Copy link"');
    
    // Verify clipboard contains post URL
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/posts/');
    
    // Verify success message
    await expect(page.locator('text="Link copied"')).toBeVisible();
  });

  test('should filter posts by hashtag', async ({ page }) => {
    // Create posts with different hashtags
    const posts = [
      { content: 'Milonga tonight! #milonga #dance' },
      { content: 'Tango class tomorrow #class #tango' },
      { content: 'Another milonga post #milonga' }
    ];
    
    for (const post of posts) {
      await page.click('[data-testid="create-post-button"]');
      await page.fill('[data-testid="post-composer"]', post.content);
      await page.click('button:has-text("Post")');
      await page.waitForSelector(`text="${post.content}"`);
    }
    
    // Click on #milonga hashtag
    await page.click('text="#milonga"').first();
    
    // Should navigate to hashtag page
    await expect(page).toHaveURL(/\/hashtag\/milonga/);
    
    // Should show only posts with #milonga
    await expect(page.locator('text="Milonga tonight!"')).toBeVisible();
    await expect(page.locator('text="Another milonga post"')).toBeVisible();
    await expect(page.locator('text="Tango class tomorrow"')).not.toBeVisible();
  });

  test('should mention users in posts', async ({ page }) => {
    await page.click('[data-testid="create-post-button"]');
    
    // Type @ to trigger mention
    await page.fill('[data-testid="post-composer"]', 'Thanks @');
    
    // Wait for mention suggestions
    await page.waitForSelector('[data-testid="mention-suggestions"]');
    
    // Select first user
    await page.click('[data-testid="mention-suggestion"]').first();
    
    // Continue typing
    const composer = page.locator('[data-testid="post-composer"]');
    const currentText = await composer.inputValue();
    await composer.fill(currentText + ' for the great class!');
    
    // Submit post
    await page.click('button:has-text("Post")');
    
    // Verify mention is rendered as link
    const post = page.locator('[data-testid="post-item"]').first();
    const mention = post.locator('a[data-mention]');
    await expect(mention).toBeVisible();
    await expect(mention).toHaveAttribute('href', /\/users\//);
  });

  test('should save and unsave posts', async ({ page }) => {
    // Create a post
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-composer"]', 'Post to save');
    await page.click('button:has-text("Post")');
    await page.waitForSelector('text="Post to save"');
    
    const post = page.locator('[data-testid="post-item"]:has-text("Post to save")');
    
    // Save post
    await post.locator('[data-testid="post-menu"]').click();
    await page.click('text="Save post"');
    
    // Navigate to saved posts
    await page.click('[data-testid="user-menu"]');
    await page.click('text="Saved posts"');
    
    // Verify post appears in saved
    await expect(page.locator('text="Post to save"')).toBeVisible();
    
    // Unsave post
    const savedPost = page.locator('[data-testid="post-item"]:has-text("Post to save")');
    await savedPost.locator('[data-testid="post-menu"]').click();
    await page.click('text="Unsave post"');
    
    // Verify removed from saved
    await expect(page.locator('text="Post to save"')).not.toBeVisible();
  });

  test('should report inappropriate post', async ({ page }) => {
    // Navigate to feed with existing posts
    await page.goto(`${BASE_URL}/feed`);
    
    // Find any post (not own)
    const post = page.locator('[data-testid="post-item"]').first();
    
    // Open menu and report
    await post.locator('[data-testid="post-menu"]').click();
    await page.click('text="Report"');
    
    // Select reason
    await page.click('[data-testid="report-reason-spam"]');
    
    // Add description
    await page.fill('[data-testid="report-description"]', 'This is spam content');
    
    // Submit report
    await page.click('button:has-text("Submit report")');
    
    // Verify success message
    await expect(page.locator('text="Report submitted"')).toBeVisible();
  });

  test('should handle infinite scroll in feed', async ({ page }) => {
    // Navigate to feed
    await page.goto(`${BASE_URL}/feed`);
    
    // Count initial posts
    const initialPosts = await page.locator('[data-testid="post-item"]').count();
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for more posts to load
    await page.waitForTimeout(2000);
    
    // Count posts after scroll
    const afterScrollPosts = await page.locator('[data-testid="post-item"]').count();
    
    // Should have loaded more posts
    expect(afterScrollPosts).toBeGreaterThan(initialPosts);
  });

  test('should show post visibility options', async ({ page }) => {
    await page.click('[data-testid="create-post-button"]');
    
    // Click visibility dropdown
    await page.click('[data-testid="visibility-dropdown"]');
    
    // Verify options
    await expect(page.locator('text="Public"')).toBeVisible();
    await expect(page.locator('text="Friends only"')).toBeVisible();
    await expect(page.locator('text="Private"')).toBeVisible();
    
    // Select friends only
    await page.click('text="Friends only"');
    
    // Create post
    await page.fill('[data-testid="post-composer"]', 'Friends only post');
    await page.click('button:has-text("Post")');
    
    // Verify visibility indicator
    const post = page.locator('[data-testid="post-item"]:has-text("Friends only post")');
    await expect(post.locator('[data-testid="visibility-badge"]')).toHaveText('Friends only');
  });
});