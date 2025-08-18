# ESA Life CEO 53x21s - Complete n8n Import & Integration Guide
## Layer 51: n8n + HubSpot + WhaleSync Integration

## 🎯 ESA Analysis: What You Have vs What You Need

### ✅ What You Already Have:
- **HubSpot API Access** - Already configured
- **WhaleSync Integration** - Already syncing data
- **n8n Instance** - Running at mundotango.app.n8n.cloud
- **Webhook URL** - Active at /webhook/429c4621-4e0e-42dc-8eef-1965c7aa8812
- **4 Workflow JSON Files** - Ready to import

### 📋 What You Need to Do:
1. Import workflows to n8n
2. Connect HubSpot credentials
3. Test the integration
4. Activate workflows

## 🚀 ESA Solution: Step-by-Step Import Process

### Method 1: Direct Import (Easiest)

#### Step 1: Copy Workflow JSON
```bash
# Open the workflow file
cat n8n-workflows/user-registration-hubspot.json
```
Copy the entire JSON content.

#### Step 2: Import in n8n UI
1. **Open n8n**: https://mundotango.app.n8n.cloud
2. **Click** the hamburger menu (☰) in top left
3. **Select** "Workflows" → "Import from File" or "Import from URL"
4. **Paste** the JSON content
5. **Click** "Import"

#### Step 3: Configure HubSpot Connection
1. **Open** the imported workflow
2. **Click** on the HubSpot node
3. **Click** "Create New" under Credentials
4. **Select** "HubSpot Developer API"
5. **Enter** your HubSpot details:
   - **Access Token**: (your existing HubSpot API key)
   - **App ID**: 1473954 (or your app ID)
6. **Click** "Save"

### Method 2: Bulk Import All Workflows

#### Create Import File:
```bash
# Combine all workflows into one import file
cat > all-workflows-import.json << 'EOF'
[
  {
    "name": "User Registration to HubSpot",
    "workflow": $(cat n8n-workflows/user-registration-hubspot.json)
  },
  {
    "name": "TestSprite Results Processor",
    "workflow": $(cat n8n-workflows/testsprite-results-processor.json)
  },
  {
    "name": "Daily Analytics Report",
    "workflow": $(cat n8n-workflows/daily-analytics-report.json)
  },
  {
    "name": "Payment Processing",
    "workflow": $(cat n8n-workflows/payment-processing.json)
  }
]
EOF
```

## 🔌 ESA Action: Connect Your Existing Services

### 1. HubSpot Integration (You Already Have This)
Since you have HubSpot API access, in each workflow:
1. **Click** the HubSpot node
2. **Add Credential** → "HubSpot Developer API"
3. **Use** your existing API key
4. **Test** the connection

### 2. WhaleSync Integration
WhaleSync is already syncing your data. To connect with n8n:

#### Option A: Direct Database Access
```javascript
// In n8n PostgreSQL node
Host: [your-database-host]
Database: [your-database-name]
User: [your-database-user]
Password: [your-database-password]
Port: 5432
```

#### Option B: Via WhaleSync Webhooks
1. In WhaleSync, add webhook destination
2. Point to: `https://mundotango.app.n8n.cloud/webhook/[your-webhook-id]`
3. WhaleSync will push changes to n8n

### 3. Connect Database (Using Your Existing DATABASE_URL)
1. **Click** any PostgreSQL node
2. **Add Credential** → "Postgres"
3. **Parse** your DATABASE_URL:
```javascript
// If your DATABASE_URL is:
// postgresql://user:pass@host:5432/dbname

Host: host
Database: dbname
User: user
Password: pass
Port: 5432
```

## 🧪 Testing Your Integration

### Test 1: User Registration Flow
```bash
curl -X POST https://mundotango.app.n8n.cloud/webhook/429c4621-4e0e-42dc-8eef-1965c7aa8812 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "esa_test_001",
    "email": "esa.test@mundotango.life",
    "name": "ESA Test User",
    "role": "dancer",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

**Expected Results:**
1. ✅ Webhook returns 200 OK
2. ✅ Contact created in HubSpot
3. ✅ Data synced via WhaleSync
4. ✅ Entry in your database

### Test 2: Verify HubSpot Contact
1. Go to: https://app.hubspot.com/contacts
2. Search for: "esa.test@mundotango.life"
3. Verify fields:
   - Name: ESA Test User
   - Lifecycle Stage: Customer
   - Custom Property: mundo_tango_role = dancer

### Test 3: Check WhaleSync Sync
1. Open WhaleSync dashboard
2. Check recent syncs
3. Verify the new contact appears

## 📊 Complete Integration Map

```
User Registration → n8n Webhook → HubSpot API → WhaleSync → Your Database
        ↓              ↓              ↓            ↓            ↓
   Welcome Email   Workflow Log   CRM Update   Data Sync   Analytics
```

## 🎯 Quick Actions Checklist

### Immediate (Do Now):
- [ ] Copy user-registration-hubspot.json content
- [ ] Import to n8n via UI
- [ ] Add HubSpot credentials
- [ ] Send test registration
- [ ] Check HubSpot for new contact

### Next Steps (After Testing):
- [ ] Import remaining 3 workflows
- [ ] Configure email credentials
- [ ] Set up Slack notifications (optional)
- [ ] Activate daily analytics workflow
- [ ] Configure payment processing

### Advanced (When Ready):
- [ ] Create custom workflows
- [ ] Add error handling
- [ ] Set up monitoring dashboard
- [ ] Configure backup automation

## 🚨 Troubleshooting

### "Cannot import workflow"
- Check JSON is valid (use jsonlint.com)
- Ensure you're logged into n8n
- Try importing via file upload instead

### "HubSpot connection failed"
- Verify API key is correct
- Check HubSpot app has correct scopes
- Test API key: 
```bash
curl https://api.hubapi.com/contacts/v1/lists/all/contacts/all \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### "WhaleSync not syncing"
- Check WhaleSync dashboard for errors
- Verify webhook URL is correct
- Check field mappings match

### "Workflow not triggering"
- Ensure workflow is activated (toggle switch ON)
- Check webhook URL matches
- View execution history for errors

## ✅ Success Criteria

Your integration is working when:
1. **n8n webhook** receives data (200 OK)
2. **HubSpot** creates/updates contacts
3. **WhaleSync** syncs to your database
4. **Notifications** are sent (email/Slack)
5. **Analytics** are logged

## 🎉 You're Ready!

Once you import the first workflow and connect HubSpot, you'll have:
- Automated user onboarding
- CRM synchronization via HubSpot + WhaleSync
- Real-time data flow
- Complete audit trail

Start with the user registration workflow, test it, then add the others!