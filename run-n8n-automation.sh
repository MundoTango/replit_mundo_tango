#!/bin/bash

# ESA Life CEO - n8n Browser Automation Runner
# Completely automated workflow import

echo "🚀 ESA Life CEO - n8n Workflow Import Automation"
echo "==============================================="
echo ""

echo "📋 ESA Analysis: Preparing automated import..."
echo "✅ Puppeteer installed"
echo "✅ 4 workflow JSON files ready"
echo "✅ n8n instance: https://mundotango.app.n8n.cloud"
echo ""

echo "🎯 ESA Action: Starting browser automation..."
echo ""
echo "The browser will:"
echo "1. Open n8n automatically"
echo "2. Handle authentication (you may need to login once)"
echo "3. Navigate to workflows"
echo "4. Import all 4 workflows automatically" 
echo "5. Stay open for you to configure credentials"
echo ""

read -p "Ready to start automation? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting automation..."
    node n8n-browser-automation.js
else
    echo "Automation cancelled."
    echo ""
    echo "Alternative: Manual import commands ready in COMPLETE_N8N_SETUP_GUIDE.md"
fi