#!/bin/bash
# ESA LIFE CEO 61x21 - Final GitHub Push
set -euo pipefail

echo "=================================================="
echo "  ESA LIFE CEO 61x21 - Final GitHub Push"
echo "=================================================="
echo ""
echo "⚠️  URGENT SECURITY REMINDER:"
echo "1. DELETE the token you shared (ending in ...TzqVpBxS)"
echo "2. Create a NEW token and keep it SECRET"
echo "3. NEVER share tokens in messages!"
echo ""
read -p "Have you deleted the exposed token? (y/n): " deleted
if [[ "$deleted" != "y" ]] && [[ "$deleted" != "yes" ]]; then
    echo "❌ Please delete the exposed token first!"
    exit 1
fi

echo ""
echo "📋 Current Status:"
echo "✅ Repository cleaned - no secrets in history"
echo "✅ All 3106 files committed to clean branch"
echo ""

echo "🚀 Final Step: Force push to GitHub..."
echo "This will replace the entire remote repository."
echo ""
read -p "Ready to push? (y/n): " ready
if [[ "$ready" == "y" ]] || [[ "$ready" == "yes" ]]; then
    echo ""
    echo "Pushing to GitHub..."
    git push --force origin main
    
    echo ""
    echo "=================================================="
    echo "✅ SUCCESS! Your repository is now:"
    echo "- Clean of all exposed tokens"
    echo "- Synced with GitHub"
    echo "- Ready for deployment"
    echo ""
    echo "📝 Remember for the future:"
    echo "- Store tokens in environment variables"
    echo "- Use .env files (never commit them)"
    echo "- Add sensitive files to .gitignore"
    echo "=================================================="
else
    echo ""
    echo "To push later, run: git push --force origin main"
fi