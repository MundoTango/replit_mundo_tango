#!/bin/bash
# ESA LIFE CEO 61x21 - Fix Git History

echo "========================================="
echo "FIXING GIT HISTORY - Removing exposed token"
echo "========================================="
echo ""

# Show current commits
echo "Current commits:"
git log --oneline -5
echo ""

echo "Removing problematic commit from history..."
# Remove the last 3 commits and recommit clean
git reset --hard HEAD~3

echo ""
echo "Re-adding clean files..."
git add -A
git commit -m "ESA LIFE CEO 61x21 - Clean deployment optimization (no exposed tokens)"

echo ""
echo "Git history cleaned! Now ready to push."
echo "Current commits:"
git log --oneline -3

echo ""
echo "✅ History fixed! Run ./safe-github-push.sh to push"