#!/bin/bash
# ESA LIFE CEO 61x21 - GitHub Authentication Setup

echo "========================================="
echo "GitHub Authentication Setup"
echo "========================================="
echo ""
echo "To push to GitHub, you need a Personal Access Token (PAT)"
echo ""
echo "Steps:"
echo "1. Go to GitHub.com → Settings → Developer Settings → Personal Access Tokens"
echo "2. Generate a new token with 'repo' permissions"
echo "3. Copy the token"
echo ""
echo "Enter your GitHub username:"
read GITHUB_USER

echo "Enter your GitHub Personal Access Token:"
read -s GITHUB_TOKEN

# Set up authenticated remote
git remote set-url origin https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/MundoTango/replit_mundo_tango.git

echo ""
echo "Authentication configured! Now pushing to GitHub..."
git push origin main --force

echo ""
echo "✅ Push complete!"