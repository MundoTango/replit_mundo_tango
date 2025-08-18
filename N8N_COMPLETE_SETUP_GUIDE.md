# n8n Complete Setup & Capabilities Guide
## Part of ESA Life CEO 53x21s Framework

## 🚀 What You Can Do with n8n RIGHT NOW

### Your Active Webhook
```
URL: https://mundotango.app.n8n.cloud/webhook/429c4621-4e0e-42dc-8eef-1965c7aa8812
Status: ✅ Tested and Working
```

## Immediate Workflow Templates

### 1. User Onboarding Automation
**Trigger:** New user registration webhook
```json
{
  "userId": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "dancer"
}
```
**Actions to Add in n8n:**
1. **HubSpot Node** → Create/Update Contact
2. **SendGrid Node** → Send Welcome Email
3. **Google Sheets Node** → Log Registration
4. **Slack Node** → Notify Team
5. **PostgreSQL Node** → Update Database

### 2. HubSpot CRM Integration
**Setup Steps:**
1. In n8n, add HubSpot node after webhook
2. Configure with your HubSpot API key
3. Map fields:
   - Email → Contact Email
   - Name → First/Last Name
   - Role → Custom Property
   - Registration Date → Lifecycle Stage

### 3. Email Marketing Automation
**Workflow Chain:**
```
Webhook → Filter by Role → Email Service → Wait → Follow-up → Analytics
```

**Email Sequences:**
- Welcome Series (Day 0, 3, 7, 14, 30)
- Role-specific content (Dancer, Host, Teacher)
- Event notifications
- Re-engagement campaigns

### 4. TestSprite Results Processing
**Webhook URL for TestSprite:**
```
https://mundotango.app.n8n.cloud/webhook/[create-new-webhook]
```
**Workflow:**
```
TestSprite Webhook → Parse Results → If Failed → Create Jira Ticket → Send Alert
                                    → If Passed → Update Dashboard → Log Success
```

### 5. Multi-Channel Notifications
**Trigger Events:**
- New registration
- Payment received
- Event created
- Error detected
- Test completed

**Notification Channels:**
- Email (SendGrid/Resend)
- SMS (Twilio)
- Slack
- Discord
- Push (OneSignal)

## Step-by-Step Setup Instructions

### Step 1: Complete Current Webhook Workflow
1. **In n8n:**
   - Stop listening mode
   - Save workflow (Cmd/Ctrl + S)
   - Name it "User Onboarding"
   - Activate it (toggle switch)

### Step 2: Add HubSpot Integration
1. **Get HubSpot API Key:**
   - Go to HubSpot → Settings → Integrations → API Key
   - Copy your key

2. **In n8n Workflow:**
   - Add HubSpot node
   - Select "Create/Update Contact"
   - Add credentials with API key
   - Map webhook data to contact fields

### Step 3: Add Email Automation
1. **Add SendGrid/Email Node:**
   - Configure SMTP or API credentials
   - Design email template
   - Use webhook data for personalization

### Step 4: Create Additional Workflows

#### Payment Processing Workflow
```
Stripe Webhook → Validate Payment → Update User Status → Send Receipt → Log Transaction
```

#### Analytics Pipeline
```
Schedule (Daily) → Query Database → Generate Report → Export CSV → Email Stakeholders
```

#### Error Monitoring
```
Error Webhook → Parse Error → Determine Severity → Alert Team → Create Ticket → Log
```

## Advanced n8n Capabilities

### Conditional Logic
```javascript
// In n8n Function node
if (items[0].json.role === 'host') {
  // Host-specific workflow
  return [{json: {path: 'host', ...items[0].json}}];
} else if (items[0].json.role === 'dancer') {
  // Dancer-specific workflow
  return [{json: {path: 'dancer', ...items[0].json}}];
}
```

### Data Transformation
```javascript
// Transform webhook data for HubSpot
return items.map(item => ({
  json: {
    properties: {
      email: item.json.email,
      firstname: item.json.name.split(' ')[0],
      lastname: item.json.name.split(' ')[1] || '',
      lifecyclestage: 'customer',
      mundo_tango_role: item.json.role
    }
  }
}));
```

### Error Handling
- Add Error Trigger node to catch failures
- Configure retry settings (3 attempts, exponential backoff)
- Set up fallback workflows
- Log all errors to database

## Integration Endpoints

### From Your App to n8n
```javascript
// server/integrations/n8n-service.ts
export async function triggerN8NWorkflow(data: any) {
  const webhookUrl = process.env.N8N_WEBHOOK_USER_ONBOARDING;
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  return response.json();
}
```

### Available Triggers
1. **User Events**
   - Registration
   - Profile Update
   - Subscription Change
   - Login/Logout

2. **Content Events**
   - Post Created
   - Comment Added
   - Media Uploaded
   - Event Published

3. **System Events**
   - Error Occurred
   - Threshold Reached
   - Scheduled Task
   - Health Check

## Production Checklist

### ✅ Completed
- [x] Webhook created and tested
- [x] Test data successfully received
- [x] Integration code ready

### 📋 To Do
- [ ] Activate workflow in production
- [ ] Add HubSpot credentials
- [ ] Configure email service
- [ ] Set up error handling
- [ ] Add monitoring alerts
- [ ] Create backup workflows
- [ ] Document all workflows

## Monitoring & Analytics

### Key Metrics to Track
- Workflow execution success rate
- Average processing time
- Error frequency by type
- API usage limits
- Cost per execution

### Dashboard Setup
1. Create n8n metrics workflow
2. Export to Google Sheets
3. Build real-time dashboard
4. Set up alerts for failures

## Security Best Practices

1. **Use Environment Variables**
   - Never hardcode credentials
   - Rotate API keys regularly

2. **Validate Webhook Data**
   - Check required fields
   - Sanitize inputs
   - Verify signatures

3. **Rate Limiting**
   - Implement throttling
   - Queue heavy operations
   - Monitor usage patterns

4. **Access Control**
   - Restrict webhook URLs
   - Use authentication tokens
   - Audit workflow access

## Support Resources

### n8n Documentation
- [Webhook Trigger](https://docs.n8n.io/nodes/n8n-nodes-base.webhook/)
- [HubSpot Integration](https://docs.n8n.io/nodes/n8n-nodes-base.hubspot/)
- [Error Workflows](https://docs.n8n.io/workflows/error-workflows/)

### Your Webhook URLs
- Test: `https://mundotango.app.n8n.cloud/webhook-test/429c4621-4e0e-42dc-8eef-1965c7aa8812`
- Production: `https://mundotango.app.n8n.cloud/webhook/429c4621-4e0e-42dc-8eef-1965c7aa8812`

### Next Actions
1. Activate your workflow in n8n
2. Add HubSpot integration node
3. Create email automation workflow
4. Set up TestSprite webhook
5. Build analytics dashboard