# 🚀 N8N WEBHOOK SETUP - No API Needed!

Your n8n cloud instance doesn't have Public API enabled (requires Enterprise plan). 
**Good news: Webhooks work even better for our needs!**

## Step 1: Create Your First Webhook Workflow

1. **Go to Workflows** (left sidebar in n8n)
2. Click **"New Workflow"**
3. Add a **Webhook** node:
   - Click the + button
   - Search for "Webhook"
   - Select it

## Step 2: Configure the Webhook

In the Webhook node settings:
- **HTTP Method:** POST
- **Path:** `user-onboarding`
- **Response Mode:** "When Last Node Finishes"
- **Response Data:** "First Entry JSON"

## Step 3: Add Your Logic

After the webhook, add nodes for:
- **Email** (send welcome email)
- **HubSpot** (create contact)
- **Database** (log the event)

## Step 4: Activate & Copy URL

1. **Save** the workflow
2. **Activate** it (toggle switch)
3. **Copy the webhook URL** shown in the Webhook node
   - It will look like: `https://mundotango.app.n8n.cloud/webhook/abc123xyz`

## Step 5: Configure in Your App

Set these environment variables in your app:

```env
N8N_WEBHOOK_USER_ONBOARDING=https://mundotango.app.n8n.cloud/webhook/[your-webhook-id]
N8N_WEBHOOK_HUBSPOT_SYNC=https://mundotango.app.n8n.cloud/webhook/[your-webhook-id-2]
N8N_WEBHOOK_TEST_RESULTS=https://mundotango.app.n8n.cloud/webhook/[your-webhook-id-3]
```

## 📋 Create These 3 Webhook Workflows:

### 1. User Onboarding Webhook
- **Path:** `user-onboarding`
- **Purpose:** Welcome emails, initial setup
- **Receives:** `{email, name, role}`

### 2. HubSpot Sync Webhook  
- **Path:** `hubspot-sync`
- **Purpose:** Sync users to CRM
- **Receives:** `{email, name, properties}`

### 3. TestSprite Results Webhook
- **Path:** `testsprite-results`
- **Purpose:** Process test results
- **Receives:** Test result JSON

## ✅ Benefits of Webhooks vs API:

- **Simpler:** No API keys needed
- **Faster:** Direct workflow triggers
- **More reliable:** No rate limits
- **Visual:** See executions in real-time

## 🎯 Quick Test

Once your webhook is active:

```bash
curl -X POST https://mundotango.app.n8n.cloud/webhook/[your-webhook-id] \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

You'll see the execution in n8n immediately!

## Next Steps:
1. Create your first webhook workflow
2. Activate it
3. Copy the URL
4. Test it with curl
5. Your app will automatically use it!

No API needed - webhooks are the way to go! 🚀