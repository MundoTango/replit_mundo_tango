# 📦 n8n Workflow Import Instructions

## ✅ Complete Workflow Files Ready

All 4 workflows have been created with **FULL automation logic**:

### 📁 Available Files:
1. `n8n-workflows/complete/user-registration-hubspot.json`
2. `n8n-workflows/complete/payment-processing-stripe.json`
3. `n8n-workflows/complete/testsprite-results-processor.json`
4. `n8n-workflows/complete/daily-analytics-report.json`

## 🚀 How to Import into n8n

### Step 1: Download the Files
1. In Replit, navigate to `n8n-workflows/complete/` folder
2. Click on each JSON file
3. Click the download button (⬇️) to save to your computer

### Step 2: Import into n8n
1. Open your n8n instance: https://mundotango.app.n8n.cloud
2. Go to **Workflows** tab
3. Click the **"..."** menu → **Import from File**
4. Select one of the downloaded JSON files
5. The complete workflow will appear with all nodes connected!

### Step 3: Configure Credentials
Each workflow needs credentials configured:

#### User Registration to HubSpot:
- **HubSpot API**: Add your HubSpot private app token
- **Email SMTP**: Configure email settings

#### Payment Processing (Stripe):
- **Stripe API**: Add your Stripe secret key
- **Slack** (optional): For payment alerts

#### TestSprite Results Processor:
- **Slack**: For test failure alerts
- **Jira** (optional): For automatic ticket creation
- **Email SMTP**: For success reports

#### Daily Analytics Report:
- **Email SMTP**: For sending reports
- **Slack** (optional): For team notifications

### Step 4: Move to Mundo Tango Folder
1. After importing, workflows appear in Personal folder
2. Simply drag each workflow to the **Mundo Tango** folder
3. Workflow IDs and webhook URLs remain unchanged

### Step 5: Activate Workflows
1. Open each workflow
2. Click the **"Inactive"** toggle to activate
3. Test with sample data using "Execute Workflow"

## 🎯 What Each Workflow Does

### 1. User Registration to HubSpot
- Receives user registration via webhook
- Formats user data
- Creates contact in HubSpot
- Updates your database
- Sends welcome email

### 2. Payment Processing (Stripe)
- Receives Stripe webhook events
- Routes by event type (payment, subscription, failure)
- Processes payment confirmations
- Updates subscription status
- Sends email confirmations
- Alerts on failures via Slack

### 3. TestSprite Results Processor
- Receives test results via webhook
- Calculates pass/fail metrics
- Checks pass threshold (95%)
- Sends Slack alerts for failures
- Creates Jira tickets for bugs
- Emails success reports
- Stores results in database

### 4. Daily Analytics Report
- Triggers daily at 9 AM
- Fetches platform statistics
- Gets active users and trending content
- Generates beautiful HTML report
- Emails to admin team
- Posts summary to Slack
- Archives data for history

## 🔧 Webhook URLs

After importing, each webhook will have a unique URL:
- **User Registration**: `https://mundotango.app.n8n.cloud/webhook/[workflow-id]/user-registration`
- **Stripe**: `https://mundotango.app.n8n.cloud/webhook/[workflow-id]/stripe-webhook`
- **TestSprite**: `https://mundotango.app.n8n.cloud/webhook/[workflow-id]/testsprite-results`

## ✨ ESA Success!

Your n8n automations are now complete with:
- ✅ Full node connections
- ✅ Data processing logic
- ✅ Error handling
- ✅ Multiple integrations
- ✅ Professional reporting

No manual setup needed - just import, configure credentials, and activate!