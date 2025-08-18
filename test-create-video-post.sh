#!/bin/bash

# ESA LIFE CEO 56x21 - Create a test video post
echo "🎬 ESA LIFE CEO 56x21 - Creating a video post test..."

# Create a test video file
echo "Creating test video file..."
mkdir -p /tmp/test-videos
# Create a simple test video file (using ffmpeg-like binary data pattern)
head -c 1048576 /dev/urandom > /tmp/test-videos/test-video.mp4

# Upload the video with a post
echo "📤 Uploading video with post content..."
curl -X POST "http://localhost:5000/api/posts" \
  -H "Cookie: connect.sid=s%3Atest-session" \
  -F "content=🎥 ESA LIFE CEO 56x21 - Testing video display! This is a test video post created at $(date '+%Y-%m-%d %H:%M:%S')" \
  -F "isPublic=true" \
  -F "media=@/tmp/test-videos/test-video.mp4;type=video/mp4;filename=test-video.mp4" \
  -s | head -200

echo ""
echo "✅ Post created! Checking memories feed..."
sleep 2

# Check the memories feed
curl -s "http://localhost:5000/api/memories/feed" \
  -H "Cookie: connect.sid=s%3Atest-session" | \
  grep -o '"mediaEmbeds":\[[^]]*\]' | head -1

echo ""
echo "🎬 ESA LIFE CEO 56x21 - Test complete!"