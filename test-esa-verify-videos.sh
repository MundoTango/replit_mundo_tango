#!/bin/bash

echo "🎥 ESA LIFE CEO 56x21 - Video Display Verification"
echo "=================================================="
echo ""

# Test 1: Check if videos exist in the database
echo "📊 Test 1: Checking for videos in the feed..."
echo "---------------------------------------------"

RESPONSE=$(curl -s http://localhost:5000/api/memories/feed \
  -H "Cookie: connect.sid=s%3Atest-session" \
  -H "Accept: application/json")

echo "$RESPONSE" | jq '.data[] | select(.imageUrl != null or .videoUrl != null or .mediaEmbeds != null or .mediaUrls != null) | {
  id: .id,
  content: .content[0:50],
  imageUrl: .imageUrl,
  videoUrl: .videoUrl,
  mediaEmbeds: .mediaEmbeds,
  mediaUrls: .mediaUrls
}' 2>/dev/null || echo "No posts with media found"

echo ""
echo "📹 Test 2: Counting video files..."
echo "-----------------------------------"

VIDEO_COUNT=$(echo "$RESPONSE" | jq '[.data[] | 
  select(
    (.imageUrl != null and (.imageUrl | ascii_downcase | test(".mp4|.mov|.webm|.avi"))) or
    (.videoUrl != null and (.videoUrl | ascii_downcase | test(".mp4|.mov|.webm|.avi"))) or
    (.mediaEmbeds != null and (.mediaEmbeds | map(. | ascii_downcase) | map(test(".mp4|.mov|.webm|.avi")) | any)) or
    (.mediaUrls != null and (.mediaUrls | map(. | ascii_downcase) | map(test(".mp4|.mov|.webm|.avi")) | any))
  )
] | length' 2>/dev/null || echo "0")

echo "Found $VIDEO_COUNT posts with video files"

echo ""
echo "🔍 Test 3: Testing direct video URL access..."
echo "----------------------------------------------"

# Test a specific video URL
VIDEO_URL="/uploads/posts/7/1754662848512_ahp1827xy_GX010293_1754662261317.MP4"
FULL_URL="http://localhost:5000$VIDEO_URL"

echo "Testing video URL: $VIDEO_URL"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FULL_URL")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Video file is accessible (HTTP $HTTP_STATUS)"
    
    # Get file size
    FILE_SIZE=$(curl -s -I "$FULL_URL" | grep -i content-length | awk '{print $2}' | tr -d '\r')
    if [ ! -z "$FILE_SIZE" ]; then
        SIZE_MB=$(echo "scale=2; $FILE_SIZE / 1048576" | bc 2>/dev/null || echo "unknown")
        echo "📦 File size: ${SIZE_MB} MB"
    fi
else
    echo "❌ Video file not accessible (HTTP $HTTP_STATUS)"
fi

echo ""
echo "✅ ESA LIFE CEO 56x21 - Verification Summary"
echo "============================================"
echo ""
echo "1. ✅ Fixed TypeScript visibility error"
echo "2. ✅ Enhanced media URL collection logic"
echo "3. ✅ Added comprehensive debug logging"
echo "4. ✅ Improved video detection for multiple formats"
echo "5. ✅ Changed object-cover to object-contain for videos"
echo "6. ✅ Added black background for video containers"
echo ""
echo "🔍 DEBUGGING STEPS:"
echo "==================="
echo "1. Open your browser's Developer Console (F12)"
echo "2. Navigate to the Memories page"
echo "3. Look for these console messages:"
echo "   - '🎬 ESA LIFE CEO 56x21 - RENDERING MEDIA FOR POST'"
echo "   - '📎 ESA Post X mediaEmbeds/mediaUrls/imageUrl/videoUrl'"
echo "   - '🎥 ESA LIFE CEO 56x21 - RENDERING VIDEO'"
echo ""
echo "If videos still don't appear, check for:"
echo "- Console errors about video loading"
echo "- Network tab 404 errors for video URLs"
echo "- React component re-rendering issues"