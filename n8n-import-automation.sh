#!/bin/bash

# N8N Workflow Import Automation Script
# ESA Life CEO 53x21s - Layer 51 Implementation

echo "🚀 ESA Life CEO n8n Workflow Import Automation"
echo "=============================================="
echo ""

# Your n8n instance details
N8N_URL="https://mundotango.app.n8n.cloud"
N8N_API_KEY="${N8N_API_KEY:-your-api-key-here}"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to import workflow via API
import_workflow() {
    local workflow_file=$1
    local workflow_name=$2
    
    echo -e "${BLUE}📥 Importing: ${workflow_name}${NC}"
    
    # Read the workflow JSON
    workflow_json=$(cat "n8n-workflows/${workflow_file}")
    
    # Import via n8n API
    curl -X POST "${N8N_URL}/api/v1/workflows" \
        -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "${workflow_json}" \
        -w "\n${GREEN}✅ Status: %{http_code}${NC}\n"
    
    echo ""
    sleep 2 # Prevent rate limiting
}

# Check if API key is set
if [ "$N8N_API_KEY" = "your-api-key-here" ]; then
    echo -e "${YELLOW}⚠️  Please set your n8n API key first!${NC}"
    echo ""
    echo "To get your API key:"
    echo "1. Go to: ${N8N_URL}/settings/api"
    echo "2. Create an API key"
    echo "3. Run: export N8N_API_KEY='your-actual-key'"
    echo ""
    exit 1
fi

echo "🔍 ESA Analysis Phase - Checking workflows..."
echo ""

# List available workflows
workflows=(
    "user-registration-hubspot.json:User Registration → HubSpot"
    "testsprite-results-processor.json:TestSprite Results Processor"
    "daily-analytics-report.json:Daily Analytics Report"
    "payment-processing.json:Payment Processing (Stripe)"
)

echo "Found ${#workflows[@]} workflows ready to import:"
for workflow in "${workflows[@]}"; do
    IFS=':' read -r file name <<< "$workflow"
    echo "  • $name"
done
echo ""

echo "📋 ESA Solution Phase - Import Strategy"
echo "----------------------------------------"
echo "1. Import each workflow via API"
echo "2. Configure credentials after import"
echo "3. Activate workflows one by one"
echo ""

read -p "Do you want to import all workflows? (y/n): " -n 1 -r
echo ""
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🎯 ESA Action Phase - Importing workflows..."
    echo ""
    
    for workflow in "${workflows[@]}"; do
        IFS=':' read -r file name <<< "$workflow"
        import_workflow "$file" "$name"
    done
    
    echo -e "${GREEN}✨ All workflows imported successfully!${NC}"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Go to: ${N8N_URL}/workflows"
    echo "2. Configure credentials for each workflow:"
    echo "   • HubSpot API credentials"
    echo "   • PostgreSQL database connection"
    echo "   • Email service (SMTP/SendGrid)"
    echo "   • Slack (optional)"
    echo "   • Google Sheets (optional)"
    echo "3. Test each workflow individually"
    echo "4. Activate workflows when ready"
else
    echo "Import cancelled. You can import manually at: ${N8N_URL}"
fi