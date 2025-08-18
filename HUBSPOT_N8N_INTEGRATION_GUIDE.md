# HubSpot CRM Integration Guide for n8n
## Step-by-Step Setup Instructions

## Step 1: Get Your HubSpot API Key

### In HubSpot:
1. **Go to HubSpot** → https://app.hubspot.com
2. **Navigate to Settings** (gear icon in top right)
3. **Click "Integrations"** in the left menu
4. **Click "Private Apps"** (or "API Key" if available)
5. **Create a Private App** (if needed):
   - Name: "Mundo Tango n8n Integration"
   - Description: "Automates user registration to CRM"
6. **Set Scopes** (permissions):
   - ✅ crm.objects.contacts.read
   - ✅ crm.objects.contacts.write
   - ✅ crm.objects.companies.read
   - ✅ crm.objects.companies.write
   - ✅ crm.objects.deals.read
   - ✅ crm.objects.deals.write
7. **Copy your Access Token** (starts with `pat-`)

## Step 2: Configure n8n Workflow

### In n8n (https://mundotango.app.n8n.cloud):

#### A. Save Your Current Webhook Workflow
1. **Stop listening mode** (if still active)
2. **Press Cmd/Ctrl + S** to save
3. **Name it**: "User Registration to HubSpot"
4. **Activate the workflow** (toggle switch ON)

#### B. Add HubSpot Node
1. **Click the "+" button** after your webhook node
2. **Search for "HubSpot"**
3. **Select "HubSpot"** from the list
4. **Choose Operation**: "Create or Update" → "Contact"

#### C. Configure HubSpot Credentials
1. **Click "Create New Credential"**
2. **Choose "HubSpot OAuth2 API"** or "HubSpot API"
3. **Enter your Access Token** from Step 1
4. **Name**: "HubSpot Production"
5. **Click "Create"**

#### D. Map Fields from Webhook to HubSpot
In the HubSpot node, set these field mappings:

```javascript
// Click "Add Field" for each mapping:

Email:
{{ $json["email"] }}

First Name:
{{ $json["name"].split(' ')[0] }}

Last Name:
{{ $json["name"].split(' ').slice(1).join(' ') }}

// Custom Properties (create these in HubSpot first):
Mundo Tango Role:
{{ $json["role"] }}

Registration Date:
{{ $json["timestamp"] }}

User ID:
{{ $json["userId"] }}

Platform:
Mundo Tango

Lifecycle Stage:
customer
```

## Step 3: Create Custom Properties in HubSpot

### In HubSpot Settings:
1. **Go to Settings** → **Properties**
2. **Select "Contact properties"**
3. **Click "Create property"** for each:

#### Property 1: Mundo Tango Role
- Label: "Mundo Tango Role"
- Internal name: `mundo_tango_role`
- Group: "Contact information"
- Field type: "Single-line text"
- Options: dancer, host, teacher, organizer

#### Property 2: User ID
- Label: "Mundo Tango User ID"
- Internal name: `mundo_tango_user_id`
- Group: "Contact information"
- Field type: "Number"

#### Property 3: Platform
- Label: "Platform"
- Internal name: `platform`
- Group: "Contact information"
- Field type: "Single-line text"

## Step 4: Test Your Integration

### Send Test Data from Your App:
```bash
curl -X POST https://mundotango.app.n8n.cloud/webhook/429c4621-4e0e-42dc-8eef-1965c7aa8812 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "12345",
    "email": "test@example.com",
    "name": "John Doe",
    "role": "dancer",
    "timestamp": "2025-08-06T14:45:00Z"
  }'
```

### Expected Result in HubSpot:
- New contact created with email "test@example.com"
- First name: "John"
- Last name: "Doe"
- Custom properties filled
- Lifecycle stage: "Customer"

## Step 5: Add Error Handling

### In n8n Workflow:
1. **Add Error Trigger Node**:
   - Click "+" → Search "Error Trigger"
   - Connect to notification service

2. **Configure Retry Logic**:
   - In HubSpot node settings
   - Set "Retry on fail": Yes
   - Max tries: 3
   - Wait between tries: 5000ms

3. **Add Logging**:
   - Add "Function" node after HubSpot
   - Log successful creates:
   ```javascript
   const hubspotId = items[0].json.id;
   const email = items[0].json.properties.email;
   console.log(`Contact created: ${email} (ID: ${hubspotId})`);
   return items;
   ```

## Step 6: Advanced Workflows

### A. Role-Based Workflows
```javascript
// Add IF node after webhook
if ($json["role"] === "host") {
  // Route to "Host Onboarding" workflow
  // Create deal in HubSpot
  // Add to host email sequence
} else if ($json["role"] === "dancer") {
  // Route to "Dancer Welcome" workflow
  // Add to dancer email list
  // Send class recommendations
}
```

### B. Deal Creation for Premium Users
1. **Add another HubSpot node**
2. **Operation**: "Create" → "Deal"
3. **Map fields**:
   ```javascript
   Deal Name: {{ $json["name"] }} - Premium Subscription
   Amount: 20
   Pipeline: Sales Pipeline
   Deal Stage: Customer
   Associated Contact: {{ $node["HubSpot"].json["id"] }}
   ```

### C. Email Notification Workflow
1. **Add SendGrid/Email node**
2. **Configure welcome email**:
   ```javascript
   To: {{ $json["email"] }}
   Subject: Welcome to Mundo Tango, {{ $json["name"].split(' ')[0] }}!
   Body: HTML template with personalization
   ```

## Step 7: Production Checklist

### ✅ Before Going Live:
- [ ] Test with real user registration
- [ ] Verify custom properties in HubSpot
- [ ] Set up error notifications
- [ ] Configure retry logic
- [ ] Test all user roles (dancer, host, teacher)
- [ ] Document workflow in n8n
- [ ] Set up monitoring dashboard

### 📊 Monitor Success:
- Check HubSpot for new contacts
- Review n8n execution logs
- Track error rates
- Monitor API usage limits

## Common Issues & Solutions

### Issue 1: "Contact already exists"
**Solution**: Use "Create or Update" operation instead of just "Create"

### Issue 2: "Invalid property"
**Solution**: Create custom properties in HubSpot first

### Issue 3: "Rate limit exceeded"
**Solution**: Add delay node (1 second) between operations

### Issue 4: "Authentication failed"
**Solution**: Regenerate API key and update n8n credentials

## API Limits
- HubSpot API: 500,000 calls/day
- Burst: 100 requests/10 seconds
- Best practice: Batch operations when possible

## Next Steps

1. **Set up Lists in HubSpot**:
   - Dancers List
   - Hosts List
   - Active Users List
   - Premium Subscribers List

2. **Create Email Workflows**:
   - Welcome series (5 emails)
   - Re-engagement campaign
   - Event notifications
   - Premium upsell sequence

3. **Build Reports**:
   - Registration by role
   - Conversion rates
   - User engagement metrics
   - Revenue tracking

## Your Integration URLs

- **Webhook**: `https://mundotango.app.n8n.cloud/webhook/429c4621-4e0e-42dc-8eef-1965c7aa8812`
- **n8n Workflow**: `https://mundotango.app.n8n.cloud/workflow/[your-workflow-id]`
- **HubSpot Dashboard**: `https://app.hubspot.com/contacts/[your-portal-id]`

## Support Resources

- [n8n HubSpot Documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.hubspot/)
- [HubSpot API Reference](https://developers.hubspot.com/docs/api/crm/contacts)
- [n8n Community Forum](https://community.n8n.io/)

---

**Ready to activate?** Follow steps 1-4 to get your integration running in the next 10 minutes!