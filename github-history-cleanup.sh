#!/bin/bash
# ESA LIFE CEO 61x21 - GitHub History Cleanup Script
set -euo pipefail

echo "=================================================="
echo "  ESA LIFE CEO 61x21 - GitHub Token Cleanup"
echo "=================================================="
echo ""
echo "⚠️  CRITICAL: Before proceeding, you MUST:"
echo "1. Go to GitHub → Settings → Developer settings → Personal access tokens"
echo "2. REVOKE any tokens that were exposed"
echo "3. Create a NEW token if needed"
echo ""
read -p "Have you revoked the exposed tokens? (yes/no): " response
if [[ "$response" != "yes" ]] && [[ "$response" != "y" ]]; then
    echo "❌ Please revoke tokens first, then run this script again."
    exit 1
fi

echo ""
echo "📋 Current Status:"
echo "- Repository: https://github.com/MundoTango/replit_mundo_tango"
echo "- Issue: GitHub detected exposed tokens in git history"
echo ""

# Step 1: Update .gitignore to prevent future issues
echo "🔒 Step 1: Updating .gitignore..."
cat >> .gitignore << 'EOF'

# Security - Never commit these
push-now.sh
emergency-push.sh
safe-github-push.sh
*-token.txt
*.pat

# Large directories
uploads/
attached_assets/
tmp/

# Media files (use Git LFS instead)
*.mp4
*.mov
*.avi
*.MP4
*.MOV
EOF

git add .gitignore
git commit -m "security: update gitignore for secrets and large files" || true

# Step 2: Install git-filter-repo
echo ""
echo "📦 Step 2: Installing git-filter-repo..."
python3 -m pip install --user git-filter-repo --quiet

# Step 3: Clean history
echo ""
echo "🧹 Step 3: Removing secrets from ALL git history..."
echo "This will rewrite your git history to remove:"
echo "  - push-now.sh"
echo "  - emergency-push.sh"
echo "  - safe-github-push.sh"
echo ""
read -p "Proceed with history cleanup? (yes/no): " proceed
if [[ "$proceed" != "yes" ]] && [[ "$proceed" != "y" ]]; then
    echo "❌ Cancelled."
    exit 1
fi

# Run the cleanup
python3 -m git_filter_repo --force \
  --invert-paths \
  --path push-now.sh \
  --path emergency-push.sh \
  --path safe-github-push.sh

echo ""
echo "✅ History cleaned!"

# Step 4: Re-add origin (git-filter-repo removes it)
echo ""
echo "🔗 Step 4: Re-adding GitHub remote..."
git remote add origin https://github.com/MundoTango/replit_mundo_tango || true

# Step 5: Force push
echo ""
echo "🚀 Step 5: Force pushing clean history to GitHub..."
echo "⚠️  This will overwrite the remote history!"
read -p "Force push to GitHub? (yes/no): " push
if [[ "$push" == "yes" ]] || [[ "$push" == "y" ]]; then
    git push --force-with-lease origin main
    echo ""
    echo "✅ SUCCESS! Your repository is now clean."
    echo ""
    echo "📝 Next steps:"
    echo "1. Create a new PAT if needed: GitHub → Settings → Developer settings"
    echo "2. Configure git with: git config --global credential.helper store"
    echo "3. Future pushes will work normally with: git push origin main"
else
    echo ""
    echo "📝 To push later, run:"
    echo "   git push --force-with-lease origin main"
fi

echo ""
echo "=================================================="
echo "  Cleanup Complete!"
echo "=================================================="