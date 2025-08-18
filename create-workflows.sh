#!/bin/bash

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOWU1MzM0My1jNjFjLTQwNDgtYjk3Yy0xYjlhMmY5YWE3NTAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NTY3NTA5fQ.lM4vlCf-Wtk02zTCvJaIh3ioDco12-ui7P2lfrHwOGo"
BASE_URL="https://mundotango.app.n8n.cloud"

echo "🚀 ESA: Creating n8n Workflows with Full Automation"
echo "=================================================="
echo ""

# Workflow 1: User Registration to HubSpot
echo "📦 Creating: User Registration to HubSpot"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Registration to HubSpot",
    "nodes": [
      {
        "parameters": {
          "path": "user-registration",
          "httpMethod": "POST",
          "responseMode": "onReceived",
          "options": {}
        },
        "id": "webhook1",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1.1,
        "position": [250, 300]
      },
      {
        "parameters": {},
        "id": "hubspot1",
        "name": "HubSpot",
        "type": "n8n-nodes-base.hubspot",
        "typeVersion": 2,
        "position": [450, 300]
      }
    ],
    "connections": {
      "Webhook": {
        "main": [[{"node": "HubSpot", "type": "main", "index": 0}]]
      }
    },
    "settings": {},
    "staticData": null
  }')

if echo "$RESPONSE" | grep -q '"id"'; then
  ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Created! ID: $ID"
  echo "   URL: $BASE_URL/workflow/$ID"
else
  echo "❌ Failed: $RESPONSE"
fi

echo ""

# Workflow 2: TestSprite Results Processor
echo "📦 Creating: TestSprite Results Processor"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestSprite Results Processor",
    "nodes": [
      {
        "parameters": {
          "path": "testsprite-results",
          "httpMethod": "POST",
          "responseMode": "onReceived",
          "options": {}
        },
        "id": "webhook2",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1.1,
        "position": [250, 300]
      }
    ],
    "connections": {},
    "settings": {},
    "staticData": null
  }')

if echo "$RESPONSE" | grep -q '"id"'; then
  ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Created! ID: $ID"
  echo "   URL: $BASE_URL/workflow/$ID"
else
  echo "❌ Failed: $RESPONSE"
fi

echo ""

# Workflow 3: Daily Analytics Report
echo "📦 Creating: Daily Analytics Report"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Analytics Report",
    "nodes": [
      {
        "parameters": {
          "rule": {
            "cronExpression": "0 9 * * *"
          }
        },
        "id": "cron1",
        "name": "Cron",
        "type": "n8n-nodes-base.cron",
        "typeVersion": 1,
        "position": [250, 300]
      }
    ],
    "connections": {},
    "settings": {},
    "staticData": null
  }')

if echo "$RESPONSE" | grep -q '"id"'; then
  ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Created! ID: $ID"
  echo "   URL: $BASE_URL/workflow/$ID"
else
  echo "❌ Failed: $RESPONSE"
fi

echo ""

# Workflow 4: Payment Processing (Stripe)
echo "📦 Creating: Payment Processing (Stripe)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Payment Processing (Stripe)",
    "nodes": [
      {
        "parameters": {
          "path": "stripe-webhook",
          "httpMethod": "POST",
          "responseMode": "onReceived",
          "options": {}
        },
        "id": "stripewebhook",
        "name": "Stripe Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1.1,
        "position": [250, 300]
      }
    ],
    "connections": {},
    "settings": {},
    "staticData": null
  }')

if echo "$RESPONSE" | grep -q '"id"'; then
  ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Created! ID: $ID"
  echo "   URL: $BASE_URL/workflow/$ID"
else
  echo "❌ Failed: $RESPONSE"
fi

echo ""
echo "=================================================="
echo "🎉 ESA COMPLETE! Check your n8n UI now!"
echo "=================================================="
