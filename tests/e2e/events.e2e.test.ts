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

// Helper to create event
async function createTestEvent(page: Page, eventData: any) {
  await page.goto(`${BASE_URL}/events/create`);
  
  await page.fill('[name="title"]', eventData.title);
  await page.fill('[name="description"]', eventData.description);
  await page.click('[name="eventType"]');
  await page.click(`text="${eventData.type}"`);
  
  await page.fill('[name="date"]', eventData.date);
  await page.fill('[name="startTime"]', eventData.startTime);
  await page.fill('[name="endTime"]', eventData.endTime);
  
  await page.fill('[name="venue"]', eventData.venue);
  await page.fill('[name="address"]', eventData.address);
  
  if (eventData.price) {
    await page.fill('[name="price"]', eventData.price.toString());
  }
  
  await page.click('button:has-text("Create Event")');
  await page.waitForURL(/\/events\/\d+/);
}

test.describe('Events E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should browse upcoming events', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    
    // Verify events are displayed
    await expect(page.locator('[data-testid="event-card"]').first()).toBeVisible();
    
    // Check event details are shown
    const firstEvent = page.locator('[data-testid="event-card"]').first();
    await expect(firstEvent.locator('[data-testid="event-title"]')).toBeVisible();
    await expect(firstEvent.locator('[data-testid="event-date"]')).toBeVisible();
    await expect(firstEvent.locator('[data-testid="event-location"]')).toBeVisible();
  });

  test('should filter events by type', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    
    // Apply milonga filter
    await page.click('[data-testid="event-type-filter"]');
    await page.click('[data-testid="filter-milonga"]');
    
    // Verify only milongas are shown
    const events = page.locator('[data-testid="event-card"]');
    const count = await events.count();
    
    for (let i = 0; i < count; i++) {
      await expect(events.nth(i).locator('[data-testid="event-type"]')).toHaveText('Milonga');
    }
  });

  test('should create a new milonga event', async ({ page }) => {
    const eventData = {
      title: 'Test Milonga at Salon Canning',
      description: 'Join us for an amazing night of tango dancing!',
      type: 'Milonga',
      date: '2025-09-15',
      startTime: '22:00',
      endTime: '03:00',
      venue: 'Salon Canning',
      address: 'Av. Raúl Scalabrini Ortiz 1331, Buenos Aires',
      price: 2500
    };
    
    await createTestEvent(page, eventData);
    
    // Verify event was created
    await expect(page.locator('h1')).toContainText(eventData.title);
    await expect(page.locator('[data-testid="event-description"]')).toContainText(eventData.description);
  });

  test('should RSVP to an event', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    
    // Click on first event
    const firstEvent = page.locator('[data-testid="event-card"]').first();
    await firstEvent.click();
    
    // RSVP
    await page.click('[data-testid="rsvp-button"]');
    
    // Select attendance option
    await page.click('[data-testid="attendance-yes"]');
    
    // Add note
    await page.fill('[data-testid="rsvp-note"]', "Looking forward to it!");
    
    // Confirm RSVP
    await page.click('button:has-text("Confirm RSVP")');
    
    // Verify RSVP status
    await expect(page.locator('[data-testid="rsvp-status"]')).toContainText('Attending');
  });

  test('should add event to calendar', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/events`);
    
    // Navigate to event
    const firstEvent = page.locator('[data-testid="event-card"]').first();
    await firstEvent.click();
    
    // Click add to calendar
    await page.click('[data-testid="add-to-calendar"]');
    
    // Download ICS file
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text="Download .ics file"')
    ]);
    
    // Verify download
    expect(download.suggestedFilename()).toContain('.ics');
  });

  test('should share event on social media', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/events/1`); // Assuming event 1 exists
    
    // Click share button
    await page.click('[data-testid="share-event"]');
    
    // Copy link
    await page.click('text="Copy link"');
    
    // Verify clipboard
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/events/1');
    
    // Check social share options
    await page.click('[data-testid="share-event"]');
    await expect(page.locator('text="Share on Facebook"')).toBeVisible();
    await expect(page.locator('text="Share on Twitter"')).toBeVisible();
  });

  test('should view event attendees', async ({ page }) => {
    await page.goto(`${BASE_URL}/events/1`);
    
    // Navigate to attendees tab
    await page.click('[data-testid="attendees-tab"]');
    
    // Verify attendees list
    await expect(page.locator('[data-testid="attendee-item"]').first()).toBeVisible();
    
    // Filter by dance role
    await page.click('[data-testid="role-filter"]');
    await page.click('text="Leaders"');
    
    // Verify filtered results
    const attendees = page.locator('[data-testid="attendee-item"]');
    const count = await attendees.count();
    
    for (let i = 0; i < count; i++) {
      await expect(attendees.nth(i).locator('[data-testid="dance-role"]')).toContainText('Leader');
    }
  });

  test('should search events by location', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    
    // Open location search
    await page.click('[data-testid="location-search"]');
    await page.fill('[data-testid="location-input"]', 'Palermo');
    
    // Apply location filter
    await page.click('[data-testid="apply-location"]');
    
    // Verify results are in Palermo
    const events = page.locator('[data-testid="event-card"]');
    const count = await events.count();
    
    for (let i = 0; i < count; i++) {
      await expect(events.nth(i).locator('[data-testid="event-location"]')).toContainText('Palermo');
    }
  });

  test('should handle paid event registration', async ({ page }) => {
    // Create paid event
    const paidEvent = {
      title: 'Premium Milonga Night',
      description: 'Exclusive milonga with live orchestra',
      type: 'Milonga',
      date: '2025-09-20',
      startTime: '21:00',
      endTime: '02:00',
      venue: 'Teatro Colon',
      address: 'Cerrito 628, Buenos Aires',
      price: 5000
    };
    
    await createTestEvent(page, paidEvent);
    
    // Click buy tickets
    await page.click('[data-testid="buy-tickets-button"]');
    
    // Select ticket quantity
    await page.fill('[data-testid="ticket-quantity"]', '2');
    
    // Proceed to payment
    await page.click('button:has-text("Proceed to Payment")');
    
    // Verify payment form
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('10,000');
  });

  test('should view event on map', async ({ page }) => {
    await page.goto(`${BASE_URL}/events/1`);
    
    // Click view on map
    await page.click('[data-testid="view-on-map"]');
    
    // Verify map is displayed
    await expect(page.locator('[data-testid="event-map"]')).toBeVisible();
    
    // Verify marker is present
    await expect(page.locator('[data-testid="event-marker"]')).toBeVisible();
    
    // Get directions
    await page.click('[data-testid="get-directions"]');
    
    // Should open in new tab (Google Maps)
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('[data-testid="get-directions"]')
    ]);
    
    expect(newPage.url()).toContain('maps.google.com');
  });

  test('should cancel event RSVP', async ({ page }) => {
    // First RSVP to an event
    await page.goto(`${BASE_URL}/events/1`);
    await page.click('[data-testid="rsvp-button"]');
    await page.click('[data-testid="attendance-yes"]');
    await page.click('button:has-text("Confirm RSVP")');
    
    // Now cancel
    await page.click('[data-testid="cancel-rsvp"]');
    
    // Confirm cancellation
    await page.fill('[data-testid="cancellation-reason"]', 'Schedule conflict');
    await page.click('button:has-text("Cancel RSVP")');
    
    // Verify status
    await expect(page.locator('[data-testid="rsvp-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="rsvp-status"]')).not.toBeVisible();
  });

  test('should edit own event', async ({ page }) => {
    // Create event first
    const eventData = {
      title: 'Editable Test Event',
      description: 'Original description',
      type: 'Practice',
      date: '2025-09-25',
      startTime: '19:00',
      endTime: '21:00',
      venue: 'Dance Studio',
      address: 'Test Address 123'
    };
    
    await createTestEvent(page, eventData);
    
    // Edit event
    await page.click('[data-testid="event-menu"]');
    await page.click('text="Edit Event"');
    
    // Update details
    await page.fill('[name="description"]', 'Updated description with more details');
    await page.fill('[name="startTime"]', '18:30');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify updates
    await expect(page.locator('[data-testid="event-description"]')).toContainText('Updated description');
    await expect(page.locator('[data-testid="event-time"]')).toContainText('18:30');
  });

  test('should view past events', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    
    // Switch to past events
    await page.click('[data-testid="past-events-tab"]');
    
    // Verify past events are shown
    const events = page.locator('[data-testid="event-card"]');
    const count = await events.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify dates are in the past
    for (let i = 0; i < Math.min(count, 3); i++) {
      const dateText = await events.nth(i).locator('[data-testid="event-date"]').textContent();
      const eventDate = new Date(dateText!);
      expect(eventDate).toBeLessThan(new Date());
    }
  });

  test('should export event to personal calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/events/1`);
    
    // Add to Google Calendar
    await page.click('[data-testid="add-to-calendar"]');
    
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('text="Add to Google Calendar"')
    ]);
    
    // Verify Google Calendar URL
    expect(popup.url()).toContain('calendar.google.com/calendar/render');
    expect(popup.url()).toContain('action=TEMPLATE');
    
    await popup.close();
  });

  test('should report inappropriate event', async ({ page }) => {
    await page.goto(`${BASE_URL}/events/1`);
    
    // Report event
    await page.click('[data-testid="event-menu"]');
    await page.click('text="Report Event"');
    
    // Select reason
    await page.click('[data-testid="report-misleading"]');
    
    // Add details
    await page.fill('[data-testid="report-details"]', 'Event information is misleading');
    
    // Submit report
    await page.click('button:has-text("Submit Report")');
    
    // Verify success
    await expect(page.locator('text="Report submitted successfully"')).toBeVisible();
  });
});