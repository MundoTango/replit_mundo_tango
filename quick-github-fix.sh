#!/bin/bash
# ESA LIFE CEO 61x21 - Quick GitHub Force Push

echo "========================================="
echo "QUICK GITHUB FORCE PUSH FIX"
echo "========================================="
echo ""
echo "This script will:"
echo "1. Configure GitHub authentication"
echo "2. Force push to overwrite remote"
echo ""
echo "📋 You need a GitHub Personal Access Token:"
echo "   → Go to: github.com/settings/tokens"
echo "   → Click 'Generate new token (classic)'"
echo "   → Select 'repo' scope"
echo "   → Copy the token"
echo ""
echo "Enter GitHub username (or press Enter for 'MundoTango'):"
read GITHUB_USER
if [ -z "$GITHUB_USER" ]; then
    GITHUB_USER="MundoTango"
fi

echo "Enter your Personal Access Token:"
read -s GITHUB_TOKEN
echo ""

# Set authenticated remote
echo "Configuring authentication..."
git remote set-url origin https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/MundoTango/replit_mundo_tango.git

# Force push
echo "Force pushing to GitHub..."
git push --force-with-lease origin main || git push --force origin main

echo ""
echo "✅ Done! Check: https://github.com/MundoTango/replit_mundo_tango"