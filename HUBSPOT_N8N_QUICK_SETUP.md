# Quick HubSpot Setup in n8n - Do This Now!

## Step 1: Open Your n8n Workflow
Go to: https://mundotango.app.n8n.cloud/workflow

## Step 2: Add HubSpot Node

### In your n8n workflow:
1. **Click the "+" button** after your webhook node
2. **Type "HubSpot"** in the search
3. **Click on "HubSpot"** to add it

## Step 3: Configure HubSpot Node

### In the HubSpot node settings:

**Resource:** Contact
**Operation:** Create or Update

### Click "Add Credential":
1. Choose **"HubSpot Developer API"**
2. **API Key**: (You'll need to get this from HubSpot)
3. **App ID**: 1473954 (default)

### To Get Your HubSpot API Key:
1. Go to: https://app.hubspot.com
2. Click Settings (gear icon)
3. Go to Integrations → Private Apps
4. Create a new private app called "n8n Integration"
5. Copy the access token

## Step 4: Map Your Data

### In the HubSpot node, set up these mappings:

**Email (Required):**
```
{{ $json["email"] }}
```

**First Name:**
```
{{ $json["name"] ? $json["name"].split(' ')[0] : '' }}
```

**Last Name:**
```
{{ $json["name"] ? $json["name"].split(' ').slice(1).join(' ') : '' }}
```

**Additional Properties** (click "Add Property"):
- Property Name: `lifecyclestage`
- Value: `customer`

## Step 5: Test It!

### Send test data to your webhook:
```bash
curl -X POST https://mundotango.app.n8n.cloud/webhook/429c4621-4e0e-42dc-8eef-1965c7aa8812 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "dancer",
    "timestamp": "2025-08-06T14:45:00Z"
  }'
```

## Step 6: Save and Activate

1. **Press Ctrl+S** to save your workflow
2. **Name it**: "User Registration to HubSpot"
3. **Toggle the Active switch** to ON

## That's it! Your workflow is now:
✅ Receiving user registrations via webhook
✅ Creating contacts in HubSpot automatically
✅ Running 24/7 in the cloud

## Check Your Results:
- **In n8n**: Click "Executions" to see workflow runs
- **In HubSpot**: Go to Contacts to see new entries

## Common Fields You Can Add:

| HubSpot Field | n8n Expression |
|---------------|----------------|
| Phone | `{{ $json["phone"] }}` |
| Company | `{{ $json["company"] }}` |
| Website | `{{ $json["website"] }}` |
| Job Title | `{{ $json["role"] }}` |
| Notes | `Registered via Mundo Tango on {{ $now }}` |

## Next: Add More Automations

### After HubSpot node, you can add:
- **Email node** → Send welcome email
- **Slack node** → Notify your team
- **Google Sheets** → Log registrations
- **If node** → Different paths for different roles

---
**Need help?** The webhook is working. Now just add the HubSpot node and map the fields!