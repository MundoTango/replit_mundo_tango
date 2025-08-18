# n8n Webhook Troubleshooting Guide

## Current Issue
The webhook returns 404 error: "The requested webhook is not registered"

## Solution Steps

### Option 1: Test Mode (For Testing)
1. In your n8n workflow, make sure you see the Webhook node
2. Click on the **Webhook node** to select it
3. Look for the **"Listen for test event"** button at the bottom
4. Click it and wait for "Listening for test event" message
5. The webhook URL should show in the node
6. Send ONE test request (the webhook only listens for one request in test mode)

### Option 2: Production Mode (For Continuous Use)
1. **Stop Listening** if currently in test mode
2. **Save** the workflow (Cmd/Ctrl + S)
3. **Activate** the workflow using the toggle switch at the top right
4. The webhook will now work continuously without needing to click "Listen"

## Webhook URLs

### Test URL (one-time use):
```
https://mundotango.app.n8n.cloud/webhook-test/429c4821-4a0e-42dc-8aef-1965c7aa8812
```

### Production URL (after activation):
```
https://mundotango.app.n8n.cloud/webhook/429c4821-4a0e-42dc-8aef-1965c7aa8812
```

## Common Issues

### "Not registered" error
- The webhook is not listening (click "Listen for test event")
- The workflow is not activated (toggle the activation switch)
- Wrong URL (use webhook-test for testing, webhook for production)

### "Only works for one call" message
- This is normal in test mode
- Click "Listen for test event" again for each test
- Or activate the workflow for continuous operation

## Test Command
Once listening or activated, test with:
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```