# 📍 How to Enable n8n API - Step by Step

## You're in the right place, but need to look elsewhere!

Based on your screenshots, you're in the Project Settings. The API settings are in your **User Settings**, not Project Settings.

## Step-by-Step Instructions:

### 1. Go to User Settings
- Click on your profile icon (top right corner)
- Select "Settings" from the dropdown
- OR go directly to: https://mundotango.app.n8n.cloud/settings

### 2. Find API Settings
- In the Settings menu, look for "API" or "n8n API"
- You might see tabs like: Personal, API, Security

### 3. Generate API Key
- Click on "API" section
- Click "Generate API Key" or "Create new API key"
- Copy the generated key immediately (you won't see it again!)

### 4. Enable Public API (if option exists)
- Toggle "Enable Public API" to ON
- Save settings

## Alternative: Use Webhook Credentials

If you can't find API settings, you can use webhooks instead:

### In your n8n workflows:
1. Click "Credentials" tab (where you are now)
2. Click "Add first credential"
3. Search for "Webhook"
4. Create a webhook credential
5. Use webhooks in your workflows instead of API

### Create these webhook workflows:
1. **New Workflow** → Add "Webhook" node
2. Set HTTP Method: POST
3. Set Path: `/user-onboarding`
4. Copy the webhook URL
5. Use that URL from your app

## 🔍 Can't find API settings?

Some n8n cloud instances don't have Public API enabled by default. If you can't find it:

1. **Use Webhooks instead** - They work just as well!
2. **Contact n8n support** - Ask them to enable Public API for your instance
3. **Upgrade your plan** - Some features require higher tier plans

## 💡 Quick Test

Once you have either API key or webhook URL:

```bash
# For API (if enabled):
curl -H "X-N8N-API-KEY: your-key" \
     https://mundotango.app.n8n.cloud/api/v1/workflows

# For Webhook:
curl -X POST https://mundotango.app.n8n.cloud/webhook/your-webhook-id \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
```

## Your Current Setup:
- Instance: https://mundotango.app.n8n.cloud
- Project: cQBmwzKemNmDPHHH
- Status: Need to enable API or use webhooks

The app will work perfectly with webhooks if API isn't available!