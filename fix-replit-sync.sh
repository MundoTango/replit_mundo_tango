#!/bin/bash
# ESA LIFE CEO 61x21 - Fix Replit Git Sync
set -euo pipefail

echo "=================================================="
echo "  Fix Replit Automatic Git Sync"
echo "=================================================="
echo ""
echo "This will merge GitHub's Dependabot commits with"
echo "your local changes so Replit sync works again."
echo ""

# Clean up locks
rm -f .git/index.lock .git/refs/remotes/origin/HEAD.lock 2>/dev/null || true

echo "📥 Fetching latest from GitHub..."
git fetch origin

echo ""
echo "📊 Current status:"
echo "Local:  $(git log --oneline -n 1)"
echo "GitHub: $(git log --oneline origin/main -n 1)"

echo ""
echo "🔄 Pulling and rebasing changes..."
if git pull origin main --rebase; then
    echo "✅ Success! Replit sync should work now."
    echo ""
    echo "The automatic sync will work because:"
    echo "- Local and GitHub histories are aligned"
    echo "- No more divergent commits"
else
    echo ""
    echo "⚠️  Merge conflict detected. Resolving..."
    echo ""
    echo "Choose resolution strategy:"
    echo "1. Keep your local version (recommended)"
    echo "2. Accept GitHub's version"
    echo ""
    read -p "Your choice (1 or 2): " choice
    
    if [[ "$choice" == "1" ]]; then
        git rebase --abort 2>/dev/null || true
        git pull origin main --strategy=ours --no-edit
        echo "✅ Kept local version. Pushing to GitHub..."
        git push origin main
    else
        git rebase --abort 2>/dev/null || true
        git reset --hard origin/main
        echo "✅ Accepted GitHub version."
    fi
fi

echo ""
echo "=================================================="
echo "✅ Replit sync fixed! The automatic sync will"
echo "   now work without manual intervention."
echo "=================================================="