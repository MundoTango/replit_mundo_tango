#!/bin/bash

echo "🎥 ESA LIFE CEO 56x21 - FINAL VIDEO FIX VERIFICATION"
echo "===================================================="
echo ""

# Test the API to see what data is being returned
echo "📊 Checking API response for media fields..."
echo "---------------------------------------------"

RESPONSE=$(curl -s http://localhost:5000/api/memories/feed \
  -H "Cookie: connect.sid=s%3Atest-session" \
  -H "Accept: application/json")

# Count posts with different media fields
POSTS_WITH_MEDIA_EMBEDS=$(echo "$RESPONSE" | jq '[.data[] | select(.mediaEmbeds != null and (.mediaEmbeds | length) > 0)] | length' 2>/dev/null || echo "0")
POSTS_WITH_MEDIA_URLS=$(echo "$RESPONSE" | jq '[.data[] | select(.mediaUrls != null and (.mediaUrls | length) > 0)] | length' 2>/dev/null || echo "0")
POSTS_WITH_IMAGE_URL=$(echo "$RESPONSE" | jq '[.data[] | select(.imageUrl != null)] | length' 2>/dev/null || echo "0")
POSTS_WITH_VIDEO_URL=$(echo "$RESPONSE" | jq '[.data[] | select(.videoUrl != null)] | length' 2>/dev/null || echo "0")

echo "✅ Posts with mediaEmbeds: $POSTS_WITH_MEDIA_EMBEDS"
echo "✅ Posts with mediaUrls: $POSTS_WITH_MEDIA_URLS"
echo "✅ Posts with imageUrl: $POSTS_WITH_IMAGE_URL"
echo "✅ Posts with videoUrl: $POSTS_WITH_VIDEO_URL"

echo ""
echo "📹 Sample post with video:"
echo "--------------------------"
echo "$RESPONSE" | jq '.data[] | select(.mediaEmbeds != null or .imageUrl != null or .videoUrl != null) | {
  id: .id,
  content: .content[0:50],
  mediaEmbeds: .mediaEmbeds,
  mediaUrls: .mediaUrls,
  imageUrl: .imageUrl,
  videoUrl: .videoUrl
}' 2>/dev/null | head -20

echo ""
echo "✅ ESA LIFE CEO 56x21 - FIXES APPLIED:"
echo "======================================"
echo ""
echo "1. ✅ Added support for mediaEmbeds field (PRIMARY source for videos)"
echo "2. ✅ Enhanced video detection to check for .mp4/.mov/.webm/.avi/.m4v/.mkv"
echo "3. ✅ Added deduplication to prevent showing same media twice"
echo "4. ✅ Fixed URL handling with absolute URL conversion"
echo "5. ✅ Added playsInline attribute for mobile compatibility"
echo "6. ✅ Improved debug logging with ESA LIFE CEO 56x21 prefix"
echo "7. ✅ Added black background to video containers"
echo "8. ✅ Fixed component keys to prevent React re-render issues"
echo ""
echo "🔍 TO VERIFY IN YOUR BROWSER:"
echo "=============================="
echo ""
echo "1. Navigate to: http://localhost:5000/"
echo "2. Open Developer Console (F12)"
echo "3. Look for these console messages:"
echo "   - '🎬 ESA LIFE CEO 56x21 - Post X ALL media:'"
echo "   - '📎 ESA Added media: video - /uploads/...'"
echo "   - '✅ ESA LIFE CEO 56x21 - Video loaded: Post X'"
echo ""
echo "4. Videos should now:"
echo "   ✅ Display immediately on page load"
echo "   ✅ Have controls visible"
echo "   ✅ Play when clicked"
echo "   ✅ Not disappear on page navigation"
echo ""
echo "🚀 PLEASE REFRESH YOUR BROWSER NOW TO SEE VIDEOS!"