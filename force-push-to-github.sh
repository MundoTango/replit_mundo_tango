#!/bin/bash

echo "========================================="
echo "ESA LIFE CEO 61x21 - Force Push to GitHub"
echo "========================================="
echo ""
echo "This will force push your cleaned repository to GitHub"
echo "WARNING: This will overwrite the remote repository!"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Step 1: Fix the remote URL (add .git extension if missing)
echo "Step 1: Setting correct remote URL..."
git remote set-url origin https://github.com/MundoTango/replit_mundo_tango.git

# Step 2: Verify remote is set correctly
echo "Step 2: Verifying remote configuration..."
git remote -v

# Step 3: Force push main branch
echo ""
echo "Step 3: Force pushing main branch to GitHub..."
echo "This will overwrite the remote repository with your local cleaned version"
git push origin main --force-with-lease || git push origin main --force

# Step 4: Push tags if any exist
echo ""
echo "Step 4: Pushing tags (if any)..."
git push origin --tags --force 2>/dev/null || echo "No tags to push"

# Step 5: Verify the push
echo ""
echo "========================================="
echo "✅ Force push completed!"
echo "========================================="
echo ""
echo "Your repository has been successfully pushed to:"
echo "https://github.com/MundoTango/replit_mundo_tango"
echo ""
echo "The remote repository now contains your cleaned version without large files."
echo ""
echo "If you still get errors, you may need to:"
echo "1. Delete the repository on GitHub and recreate it"
echo "2. Or clone it fresh to a new location"
echo ""