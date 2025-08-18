#!/bin/bash

echo "========================================="
echo "ESA LIFE CEO 61x21 GitHub Push Fix Script"
echo "========================================="
echo ""
echo "This script will clean your repository and prepare it for GitHub push"
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Step 1: Install Git LFS
echo "Step 1: Setting up Git LFS..."
git lfs install || echo "Git LFS already configured"

# Step 2: Create proper .gitattributes for LFS
echo "Step 2: Configuring Git LFS tracking for video files..."
cat > .gitattributes <<'EOF'
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.mov filter=lfs diff=lfs merge=lfs -text
*.avi filter=lfs diff=lfs merge=lfs -text
*.webm filter=lfs diff=lfs merge=lfs -text
*.MP4 filter=lfs diff=lfs merge=lfs -text
EOF

# Step 3: Ensure proper .gitignore
echo "Step 3: Updating .gitignore..."
# Remove duplicates and ensure these are ignored
grep -q '^uploads/$' .gitignore || echo 'uploads/' >> .gitignore
grep -q '^attached_assets/$' .gitignore || echo 'attached_assets/' >> .gitignore
grep -q '^test-results/$' .gitignore || echo 'test-results/' >> .gitignore
grep -q '^.cache/$' .gitignore || echo '.cache/' >> .gitignore

# Step 4: Remove already-tracked large directories from Git
echo "Step 4: Removing large directories from Git tracking..."
git rm -r --cached uploads/ 2>/dev/null || echo "uploads/ not tracked"
git rm -r --cached attached_assets/ 2>/dev/null || echo "attached_assets/ not tracked"
git rm -r --cached .cache/ 2>/dev/null || echo ".cache/ not tracked"
git rm -r --cached test-results/ 2>/dev/null || echo "test-results/ not tracked"

# Step 5: Commit these changes
echo "Step 5: Committing .gitignore and .gitattributes changes..."
git add .gitattributes .gitignore
git commit -m "chore: configure LFS for videos and ignore large directories" || echo "Nothing to commit"

# Step 6: Clean repository history
echo ""
echo "========================================="
echo "IMPORTANT: Next step will REWRITE GIT HISTORY"
echo "This removes all files >90MB from entire history"
echo "========================================="
echo "Press Enter to continue with history cleanup or Ctrl+C to stop here..."
read

echo "Step 6: Cleaning repository history (removing files >90MB)..."
git filter-repo --strip-blobs-bigger-than 90M --force

# Step 7: Re-add origin remote (filter-repo removes it)
echo "Step 7: Re-adding origin remote..."
git remote add origin https://github.com/MundoTango/replit_mundo_tango.git 2>/dev/null || echo "Origin already exists"

echo ""
echo "========================================="
echo "✅ Repository cleaned successfully!"
echo "========================================="
echo ""
echo "Final step: Push to GitHub with force"
echo "Run these commands manually:"
echo ""
echo "  git remote set-url origin https://github.com/MundoTango/replit_mundo_tango.git"
echo "  git push origin main --force"
echo "  git push origin --tags --force"
echo ""
echo "Your repository will be clean and under 100MB!"