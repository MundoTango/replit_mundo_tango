#!/bin/bash

# ESA LIFE CEO 56x21 - Comprehensive Video Display Test
echo "🎬 ESA LIFE CEO 56x21 - Testing video display persistence..."
echo "================================================"

# Step 1: Create a test video post
echo ""
echo "📤 Step 1: Creating a test video post..."
echo "----------------------------------------"

# Create test video file
mkdir -p /tmp/esa-test-videos
echo "Creating test video file..."
dd if=/dev/urandom of=/tmp/esa-test-videos/esa-test.mp4 bs=1024 count=512 2>/dev/null

# Upload the video with descriptive content
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
curl -X POST "http://localhost:5000/api/posts" \
  -H "Cookie: connect.sid=s%3Atest-session" \
  -F "content=🎥 ESA LIFE CEO 56x21 - Video Display Test at $TIMESTAMP - This video should persist and be playable after page loads!" \
  -F "isPublic=true" \
  -F "media=@/tmp/esa-test-videos/esa-test.mp4;type=video/mp4;filename=esa-test.mp4" \
  -s | tee /tmp/esa-post-response.json | head -200

echo ""
echo "✅ Post created successfully!"
sleep 2

# Step 2: Fetch the memories feed
echo ""
echo "📥 Step 2: Fetching memories feed to verify video URLs..."
echo "--------------------------------------------------------"

curl -s "http://localhost:5000/api/memories/feed" \
  -H "Cookie: connect.sid=s%3Atest-session" | \
  jq '.data[0] | {id, content, mediaUrls, mediaEmbeds, imageUrl, videoUrl}' 2>/dev/null || \
  curl -s "http://localhost:5000/api/memories/feed" \
  -H "Cookie: connect.sid=s%3Atest-session" | \
  grep -o '"mediaEmbeds":\[[^]]*\]' | head -1

echo ""
echo "🔍 Step 3: Analyzing media URLs in response..."
echo "----------------------------------------------"

# Extract and display media URLs
RESPONSE=$(curl -s "http://localhost:5000/api/memories/feed" -H "Cookie: connect.sid=s%3Atest-session")

# Check for various media fields
echo "Checking mediaUrls field:"
echo "$RESPONSE" | grep -o '"mediaUrls":\[[^]]*\]' | head -1

echo ""
echo "Checking mediaEmbeds field:"
echo "$RESPONSE" | grep -o '"mediaEmbeds":\[[^]]*\]' | head -1

echo ""
echo "Checking imageUrl field:"
echo "$RESPONSE" | grep -o '"imageUrl":"[^"]*"' | head -1

echo ""
echo "Checking videoUrl field:"
echo "$RESPONSE" | grep -o '"videoUrl":"[^"]*"' | head -1

# Step 4: Test direct media access
echo ""
echo "🌐 Step 4: Testing direct media URL access..."
echo "---------------------------------------------"

# Extract the first media URL
MEDIA_URL=$(echo "$RESPONSE" | grep -o '"/uploads/posts/[^"]*\.mp4"' | head -1 | tr -d '"')

if [ ! -z "$MEDIA_URL" ]; then
    echo "Found media URL: $MEDIA_URL"
    echo "Testing access to: http://localhost:5000$MEDIA_URL"
    
    # Test if the URL is accessible
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000$MEDIA_URL")
    echo "HTTP Status Code: $STATUS"
    
    if [ "$STATUS" = "200" ]; then
        echo "✅ Video file is accessible!"
    else
        echo "❌ Video file returned status $STATUS"
    fi
else
    echo "⚠️ No video URL found in response"
fi

# Step 5: Browser console debug instructions
echo ""
echo "🖥️ Step 5: Browser Console Debug Instructions"
echo "=============================================="
echo ""
echo "Open your browser console and look for these debug logs:"
echo ""
echo "1. 🎥 ESA LIFE CEO 56x21 - Post X media analysis"
echo "   - Shows all media URLs found for each post"
echo ""
echo "2. 🎬 ESA Rendering single video from imageUrl"
echo "   - Indicates when a video is being rendered from imageUrl field"
echo ""
echo "3. 📹 ESA Media X/Y"
echo "   - Shows each media item being rendered with full URL"
echo ""
echo "4. ✅ ESA Video X metadata loaded"
echo "   - Confirms video metadata has loaded successfully"
echo ""
echo "5. ▶️ ESA Video X can play"
echo "   - Indicates video is ready to play"
echo ""
echo "6. ❌ ESA Video X load error"
echo "   - Shows any video loading errors"
echo ""
echo "7. 🔄 ESA CleanMemoryCard mounted/updated"
echo "   - Shows when component mounts or updates with media counts"
echo ""

# Step 6: Summary
echo "📊 Summary"
echo "=========="
echo ""
echo "If videos are still disappearing after page load:"
echo ""
echo "1. Check browser console for ESA debug logs"
echo "2. Look for any load errors or missing URLs"
echo "3. Verify URLs are absolute (start with http://)"
echo "4. Check if videos appear in Network tab"
echo "5. Note any React re-render patterns in console"
echo ""
echo "The enhanced debugging will show:"
echo "- When components mount/unmount"
echo "- All media URLs being processed"
echo "- Video loading lifecycle events"
echo "- Any errors during video loading"
echo ""

echo "🏁 ESA LIFE CEO 56x21 - Video Display Test Complete!"
echo ""
echo "Please refresh your browser and check the console logs!"