#!/bin/bash
# ESA LIFE CEO 61x21 - Simple GitHub History Cleanup
set -euo pipefail

echo "=================================================="
echo "  ESA LIFE CEO 61x21 - GitHub Token Cleanup"
echo "=================================================="
echo ""
echo "⚠️  CRITICAL: Before proceeding, you MUST:"
echo "1. Go to GitHub → Settings → Developer settings → Personal access tokens"
echo "2. REVOKE any tokens that were exposed (INCLUDING the one you just shared!)"
echo "3. Create a NEW token and keep it SECRET"
echo ""
read -p "Have you revoked ALL exposed tokens? (yes/no): " response
if [[ "$response" != "yes" ]] && [[ "$response" != "y" ]]; then
    echo "❌ Please revoke tokens first, then run this script again."
    exit 1
fi

echo ""
echo "📋 Using alternative cleanup method (no pip required)..."
echo ""

# Method 1: Create a fresh clean branch
echo "🔄 Creating clean branch without secrets..."

# Save current branch name
current_branch=$(git branch --show-current)

# Create orphan branch (no history)
git checkout --orphan clean-main

# Add all current files
git add -A

# Remove secret files if they exist
git rm -f --cached push-now.sh emergency-push.sh safe-github-push.sh 2>/dev/null || true

# Commit clean state
git commit -m "ESA LIFE CEO 61x21 - Clean repository state without secrets"

# Delete old main branch and rename
git branch -D main 2>/dev/null || true
git branch -m main

echo ""
echo "✅ Clean branch created!"
echo ""
echo "🚀 Force pushing clean history to GitHub..."
echo "⚠️  This will completely replace the remote repository!"
echo ""
read -p "Force push clean history? (yes/no): " push
if [[ "$push" == "yes" ]] || [[ "$push" == "y" ]]; then
    git push --force origin main
    echo ""
    echo "✅ SUCCESS! Your repository is now clean."
    echo ""
    echo "📝 Important:"
    echo "1. NEVER commit tokens or secrets to git"
    echo "2. Use environment variables for sensitive data"
    echo "3. Your repository history has been reset"
else
    echo ""
    echo "📝 To push later, run:"
    echo "   git push --force origin main"
fi

echo ""
echo "=================================================="
echo "  Cleanup Complete!"
echo "=================================================="