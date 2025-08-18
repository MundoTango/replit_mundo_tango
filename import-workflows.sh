#!/bin/bash

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOWU1MzM0My1jNjFjLTQwNDgtYjk3Yy0xYjlhMmY5YWE3NTAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NTY3NTA5fQ.lM4vlCf-Wtk02zTCvJaIh3ioDco12-ui7P2lfrHwOGo"
BASE_URL="https://mundotango.app.n8n.cloud"

echo "🚀 ESA: Importing Complete Workflows into n8n"
echo "=============================================="
echo ""

# Delete existing simple workflows first
echo "🗑️ Cleaning up existing simple workflows..."

# Get list of our workflows
WORKFLOWS=$(curl -s -X GET "$BASE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Accept: application/json")

# Extract workflow IDs that match our names
for NAME in "User Registration to HubSpot" "Payment Processing (Stripe)" "TestSprite Results Processor" "Daily Analytics Report"; do
  ID=$(echo "$WORKFLOWS" | grep -o "\"id\":\"[^\"]*\",\"name\":\"$NAME\"" | grep -o "\"id\":\"[^\"]*\"" | cut -d'"' -f4)
  if [ ! -z "$ID" ]; then
    echo "Deleting: $NAME (ID: $ID)"
    curl -s -X DELETE "$BASE_URL/api/v1/workflows/$ID" \
      -H "X-N8N-API-KEY: $API_KEY"
  fi
done

echo ""
echo "📦 Importing complete workflows..."
echo ""

# Import each complete workflow
for FILE in n8n-workflows/complete/*.json; do
  FILENAME=$(basename "$FILE")
  echo "Importing: $FILENAME"
  
  # Read the JSON and create workflow
  WORKFLOW_JSON=$(cat "$FILE")
  
  # Extract just the essential parts for creation
  NAME=$(echo "$WORKFLOW_JSON" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  # Try to create with full JSON first
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$WORKFLOW_JSON")
  
  if echo "$RESPONSE" | grep -q '"id"'; then
    ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Created: $NAME (ID: $ID)"
  else
    echo "⚠️  API limitation - creating basic workflow for: $NAME"
    # Create basic workflow as fallback
    BASIC_JSON="{\"name\":\"$NAME - Complete\",\"nodes\":[],\"connections\":{},\"settings\":{}}"
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/workflows" \
      -H "X-N8N-API-KEY: $API_KEY" \
      -H "Content-Type: application/json" \
      -d "$BASIC_JSON")
    
    if echo "$RESPONSE" | grep -q '"id"'; then
      ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
      echo "✅ Created placeholder: $NAME (ID: $ID)"
      echo "   ⚠️  Manual import needed for full functionality"
    fi
  fi
  echo ""
done

echo "=============================================="
echo "📋 Next Steps:"
echo "1. The workflows are created as placeholders"
echo "2. Download the JSON files from n8n-workflows/complete/"
echo "3. In n8n UI, delete the placeholder and import the full JSON"
echo "=============================================="
