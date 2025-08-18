#!/bin/bash
# ESA LIFE CEO 61x21 - Fix GitHub Remote Divergence

echo "========================================="
echo "ESA LIFE CEO 61x21 - GitHub Force Push Fix"
echo "========================================="
echo ""
echo "This will force push your local repository to GitHub,"
echo "overwriting any remote changes."
echo ""
echo "Current branch status:"
git branch -v
echo ""
echo "Remote configuration:"
git remote -v
echo ""
echo "⚠️  WARNING: This will overwrite the remote repository!"
echo ""
echo "To proceed, you need a GitHub Personal Access Token (PAT):"
echo "1. Go to GitHub.com → Settings → Developer Settings"
echo "2. Personal Access Tokens → Tokens (classic)"
echo "3. Generate new token with 'repo' scope"
echo ""
echo "Enter your GitHub username:"
read GITHUB_USER

echo "Enter your GitHub Personal Access Token:"
read -s GITHUB_TOKEN
echo ""

# Configure the authenticated remote
echo "Setting up authenticated remote..."
git remote set-url origin https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/MundoTango/replit_mundo_tango.git

# Force push to overwrite remote
echo ""
echo "Force pushing to GitHub (this will overwrite remote)..."
git push --force origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Repository pushed to GitHub"
    echo "📦 Repository: https://github.com/MundoTango/replit_mundo_tango"
    echo ""
    echo "Verification:"
    git log --oneline -1
    echo ""
    echo "Remote status:"
    git status
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Your GitHub username is correct"
    echo "2. Your Personal Access Token is valid"
    echo "3. The token has 'repo' permissions"
    echo "4. The repository exists at: https://github.com/MundoTango/replit_mundo_tango"
fi