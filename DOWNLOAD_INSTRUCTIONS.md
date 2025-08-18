# 📥 Download Your n8n Workflows

## Download Options

### Option 1: Download ZIP Package (Easiest)
**File:** `n8n-complete-workflows.zip`
- Contains all 4 complete workflow JSON files
- Ready to import into n8n

### Option 2: Download Individual Files
Navigate to `n8n-workflows/complete/` and download:
1. `user-registration-hubspot.json`
2. `payment-processing-stripe.json`
3. `testsprite-results-processor.json`
4. `daily-analytics-report.json`

## How to Download in Replit

1. **For ZIP file:**
   - Click on `n8n-complete-workflows.zip` in the file tree
   - Click the download button (⬇️) in the top right

2. **For individual files:**
   - Navigate to `n8n-workflows/complete/` folder
   - Click on each JSON file
   - Click the download button (⬇️)

## Import into n8n

1. Open https://mundotango.app.n8n.cloud
2. Go to **Workflows** section
3. Click the **"..."** menu → **Import from File**
4. Select your downloaded JSON file(s)
5. The complete workflow appears with all nodes connected!

## What's Included

Each workflow contains:
- ✅ All nodes fully configured
- ✅ Complete connections between nodes
- ✅ Data transformation logic
- ✅ Error handling
- ✅ Email/Slack notifications
- ✅ Database operations
- ✅ Professional HTML templates

## Quick Setup After Import

1. **Add Credentials** (one-time setup):
   - HubSpot: Add your private app token
   - Stripe: Add your secret key
   - Email: Configure SMTP settings
   - Slack: Add webhook URL (optional)

2. **Activate Workflows**:
   - Toggle the "Inactive" switch to "Active"
   - Test with sample data first

3. **Configure Webhooks**:
   - Each webhook will show its unique URL
   - Add these URLs to your services (Stripe, TestSprite, etc.)

## Workflow Descriptions

**User Registration to HubSpot**
- Captures user registrations
- Creates HubSpot contacts
- Updates your database
- Sends welcome emails

**Payment Processing (Stripe)**
- Handles all Stripe events
- Routes payments/subscriptions/failures
- Sends confirmations
- Alerts on issues

**TestSprite Results Processor**
- Processes test results
- Calculates pass rates
- Alerts on failures
- Creates Jira tickets

**Daily Analytics Report**
- Runs every morning at 9 AM
- Fetches platform stats
- Generates HTML reports
- Emails to team

Your workflows are ready to power your automation!