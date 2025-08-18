# 🔧 ESA N8N INTEGRATION GUIDE

## Phase 2: SOLUTION ARCHITECTURE (53x21s Framework)

### Your n8n Connection Details:
```
API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzhkMzdlZi0wMTkwLTQ0MDctYmI1ZC1iZWEwNmRmYTIyYmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDc5MTQ2fQ.vBp5_3hT7UrMNrVISxLgyu3VGD8DRR98IFBZ-jHyNsw
```

## 🚀 SETUP INSTRUCTIONS:

### Step 1: Configure Your n8n Instance

1. **Login to your n8n instance**
   - Go to your n8n URL (e.g., https://your-instance.app.n8n.cloud)
   - Use your credentials to login

2. **Create API Credentials**
   - Go to Settings → API
   - Your API key is already configured (see above)

### Step 2: Add Environment Variables

Add these to your deployment platform (Render/Vercel/Docker):

```bash
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzhkMzdlZi0wMTkwLTQ0MDctYmI1ZC1iZWEwNmRmYTIyYmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDc5MTQ2fQ.vBp5_3hT7UrMNrVISxLgyu3VGD8DRR98IFBZ-jHyNsw
N8N_BASE_URL=https://your-n8n-instance.app.n8n.cloud
N8N_ENCRYPTION_KEY=(generate with: openssl rand -hex 32)
N8N_JWT_SECRET=(generate with: openssl rand -hex 32)
```

### Step 3: Test n8n Connection

```bash
# Test your n8n API connection
curl -H "X-N8N-API-KEY: your-api-key" \
     https://your-n8n-instance.app.n8n.cloud/api/v1/workflows
```

### Step 4: Import Workflow Templates

Create these workflows in your n8n instance:

#### 1. User Onboarding Workflow
```json
{
  "name": "User Onboarding",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "user-onboarding",
      "parameters": {
        "path": "user-onboarding",
        "responseMode": "onReceived",
        "responseData": "allEntries"
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [450, 300],
      "parameters": {
        "fromEmail": "welcome@mundotango.life",
        "toEmail": "={{$json.email}}",
        "subject": "Welcome to Mundo Tango!",
        "text": "Welcome {{$json.name}}! Your account has been created."
      }
    },
    {
      "name": "Add to HubSpot",
      "type": "n8n-nodes-base.hubspot",
      "position": [650, 300],
      "parameters": {
        "resource": "contact",
        "operation": "create",
        "email": "={{$json.email}}",
        "additionalFields": {
          "firstName": "={{$json.name.split(' ')[0]}}",
          "lastName": "={{$json.name.split(' ').slice(1).join(' ')}}",
          "lifecycleStage": "lead"
        }
      }
    }
  ]
}
```

#### 2. TestSprite Results Processor
```json
{
  "name": "TestSprite Results",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "testsprite-results",
      "parameters": {
        "path": "testsprite-results",
        "responseMode": "onReceived"
      }
    },
    {
      "name": "Store Results",
      "type": "n8n-nodes-base.postgres",
      "position": [450, 300],
      "parameters": {
        "operation": "insert",
        "table": "test_results",
        "columns": "test_id,status,coverage,timestamp",
        "values": "={{$json.testId}},={{$json.status}},={{$json.coverage}},={{$now}}"
      }
    },
    {
      "name": "Notify Team",
      "type": "n8n-nodes-base.slack",
      "position": [650, 300],
      "parameters": {
        "channel": "#testing",
        "text": "Test Results: {{$json.status}} - Coverage: {{$json.coverage}}%"
      }
    }
  ]
}
```

#### 3. Daily Analytics Report
```json
{
  "name": "Daily Analytics",
  "nodes": [
    {
      "name": "Cron",
      "type": "n8n-nodes-base.cron",
      "position": [250, 300],
      "parameters": {
        "triggerTimes": {
          "item": [{
            "mode": "everyDay",
            "hour": 9,
            "minute": 0
          }]
        }
      }
    },
    {
      "name": "Get Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "url": "={{$env.APP_URL}}/api/analytics/daily",
        "method": "GET",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth"
      }
    },
    {
      "name": "Format Report",
      "type": "n8n-nodes-base.function",
      "position": [650, 300],
      "parameters": {
        "functionCode": "return items.map(item => ({\n  json: {\n    report: `Daily Report:\\n` +\n           `Users: ${item.json.users}\\n` +\n           `Events: ${item.json.events}\\n` +\n           `Revenue: $${item.json.revenue}`\n  }\n}));"
      }
    },
    {
      "name": "Send Report",
      "type": "n8n-nodes-base.emailSend",
      "position": [850, 300],
      "parameters": {
        "fromEmail": "reports@mundotango.life",
        "toEmail": "admin@mundotango.life",
        "subject": "Daily Analytics Report",
        "text": "={{$json.report}}"
      }
    }
  ]
}
```

## 📡 API ENDPOINTS IN YOUR APP:

### Test n8n Connection
```bash
GET /api/n8n/test
```

### Trigger Workflows
```bash
POST /api/n8n/trigger/user-onboarding
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "dancer"
}
```

### Get Workflow Status
```bash
GET /api/n8n/workflows
```

## 🐳 DOCKER DEPLOYMENT:

### Start n8n with Docker
```bash
# Start full stack
docker-compose up -d

# Check n8n logs
docker-compose logs -f n8n

# Access n8n UI
http://localhost:5678
```

## 🔗 WEBHOOK CONFIGURATION:

### Configure Webhooks in n8n
1. Each webhook node generates a unique URL
2. Format: `https://your-n8n.app.n8n.cloud/webhook/[webhook-id]`
3. Test webhooks with:
```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook/user-onboarding \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

## ✅ VERIFICATION CHECKLIST:

- [ ] n8n API key configured in environment
- [ ] n8n base URL set correctly
- [ ] Test connection endpoint working
- [ ] Workflows imported to n8n
- [ ] Webhooks configured and tested
- [ ] HubSpot credentials added to n8n
- [ ] Email credentials configured in n8n
- [ ] Docker compose tested (if using Docker)

## 🎯 INTEGRATION POINTS:

### 1. User Registration
- Triggers onboarding workflow
- Sends welcome email
- Creates HubSpot contact

### 2. Test Results
- Receives TestSprite webhooks
- Stores results in database
- Notifies team via Slack

### 3. Daily Reports
- Runs at 9 AM daily
- Collects analytics
- Sends email report

## 🚨 TROUBLESHOOTING:

**Connection Failed?**
```bash
# Check API key
echo $N8N_API_KEY

# Test with curl
curl -I -H "X-N8N-API-KEY: your-key" https://your-n8n-url/api/v1/workflows
```

**Workflow Not Triggering?**
- Check webhook URL is correct
- Verify n8n workflow is active
- Check n8n execution logs

**Docker Issues?**
```bash
# Restart n8n container
docker-compose restart n8n

# View logs
docker-compose logs n8n --tail=100
```

## 📚 RESOURCES:

- n8n Documentation: https://docs.n8n.io
- API Reference: https://docs.n8n.io/api/
- Workflow Templates: https://n8n.io/workflows
- Community Forum: https://community.n8n.io

## ✅ READY TO AUTOMATE!

Your n8n integration is configured and ready to use. Follow the steps above to complete the setup and start automating your workflows!