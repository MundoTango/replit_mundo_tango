# 🔧 N8N SETUP INSTRUCTIONS

## Your n8n Connection Details:

```
Instance URL: https://mundotango.app.n8n.cloud
API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzhkMzdlZi0wMTkwLTQ0MDctYmI1ZC1iZWEwNmRmYTIyYmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDc5MTQ2fQ.vBp5_3hT7UrMNrVISxLgyu3VGD8DRR98IFBZ-jHyNsw
```

## ⚠️ IMPORTANT: Enable n8n API Access

The n8n API is returning 404 errors. You need to enable API access in your n8n instance:

### Step 1: Enable Public API in n8n

1. **Login to your n8n instance**
   - Go to: https://mundotango.app.n8n.cloud
   - Login with your credentials

2. **Enable the Public API**
   - Go to Settings → API
   - Enable "Public API" toggle
   - Save settings

3. **Verify your API key**
   - The API key should be displayed in the API settings
   - Make sure it matches the one we're using

### Step 2: Test the Connection

Once API is enabled, test with:

```bash
# From your local machine or Replit shell:
curl -H "X-N8N-API-KEY: your-api-key" \
     https://mundotango.app.n8n.cloud/api/v1/workflows
```

You should get a JSON response with your workflows.

### Step 3: Create Required Workflows

In your n8n instance, create these workflows:

#### 1. User Onboarding Webhook
- Add a Webhook node
- Set path to: `user-onboarding`
- Set method to: POST
- Add your email/CRM integration nodes

#### 2. HubSpot Sync Webhook
- Add a Webhook node
- Set path to: `hubspot-sync`
- Connect to HubSpot CRM node

#### 3. TestSprite Results Webhook
- Add a Webhook node
- Set path to: `testsprite-results`
- Process and store test results

## 🚀 Using n8n in Your App

### Test Connection
```bash
GET http://localhost:5000/api/n8n/test
```

### Trigger Onboarding
```bash
POST http://localhost:5000/api/n8n/trigger/user-onboarding
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "dancer"
}
```

### Sync to HubSpot
```bash
POST http://localhost:5000/api/n8n/sync/hubspot
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

## 🆘 Troubleshooting

### API Returns 404?
- Public API is not enabled in n8n settings
- Check Settings → API → Enable Public API

### API Returns 401?
- API key is incorrect
- Generate a new key in n8n settings

### Workflows Not Triggering?
- Workflow is not active (toggle the Active switch)
- Webhook path doesn't match
- Check n8n execution logs

## 📝 Notes

Your n8n instance is configured at:
- URL: https://mundotango.app.n8n.cloud
- Project: cQBmwzKemNmDPHHH

The app will still work without n8n - it's an optional enhancement for automation workflows.

## ✅ Next Steps

1. Enable Public API in your n8n instance
2. Test the connection
3. Create the webhook workflows
4. Deploy your app!

Remember: n8n is optional - your app works perfectly without it!