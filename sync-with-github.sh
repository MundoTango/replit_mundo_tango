#!/bin/bash
# ESA LIFE CEO 61x21 - Sync with GitHub after Dependabot updates
set -euo pipefail

echo "=================================================="
echo "  ESA LIFE CEO 61x21 - GitHub Sync Solution"
echo "=================================================="
echo ""
echo "📋 Status: GitHub has Dependabot updates we need to sync"
echo ""

# Clean up any git locks
echo "🧹 Cleaning up git locks..."
rm -f .git/index.lock .git/refs/remotes/origin/HEAD.lock .git/objects/maintenance.lock 2>/dev/null || true

# Check current status
echo "📊 Current git status:"
git status --short

echo ""
echo "Choose sync method:"
echo "1. Keep local changes and force push (overwrites Dependabot updates)"
echo "2. Discard local changes and pull GitHub version (keeps Dependabot updates)"
echo ""
read -p "Your choice (1 or 2): " choice

if [[ "$choice" == "1" ]]; then
    echo ""
    echo "🚀 Force pushing local changes..."
    git push --force origin main
    echo "✅ Done! Local changes pushed, Dependabot updates overwritten."
    echo ""
    echo "Note: You may want to manually review and merge Dependabot PR #1"
    
elif [[ "$choice" == "2" ]]; then
    echo ""
    echo "📥 Pulling GitHub changes..."
    
    # Save local changes if any
    if [[ -n $(git status --porcelain) ]]; then
        echo "💾 Stashing local changes..."
        git stash
    fi
    
    # Reset to match GitHub
    git fetch origin
    git reset --hard origin/main
    
    echo "✅ Done! Synced with GitHub (includes Dependabot updates)"
    echo ""
    echo "Local changes were stashed. Use 'git stash pop' to restore them if needed."
    
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "=================================================="
echo "✅ GitHub sync complete!"
echo "=================================================="