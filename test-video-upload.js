#!/usr/bin/env node

/**
 * ESA LIFE CEO 56x21 - Video Upload Test Script
 * Tests video upload and display functionality
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testVideoUpload() {
  console.log('🚀 ESA LIFE CEO 56x21 - Starting Video Upload Test');
  
  const API_BASE = 'http://localhost:5000';
  
  // Test video file
  const videoPath = path.join(__dirname, 'attached_assets', 'GX010293_1754662261317.MP4');
  
  if (!fs.existsSync(videoPath)) {
    console.error('❌ Test video not found:', videoPath);
    console.log('Creating a test video file...');
    
    // Create a simple test video file
    const testVideoPath = path.join(__dirname, 'test-video.mp4');
    // Create a dummy video file for testing
    fs.writeFileSync(testVideoPath, Buffer.from('dummy video content for testing'));
    
    console.log('✅ Test video created at:', testVideoPath);
  }
  
  try {
    // Step 1: Login/Get session
    console.log('\n📝 Step 1: Getting auth session...');
    const authResponse = await fetch(`${API_BASE}/api/auth/user`, {
      credentials: 'include',
      headers: {
        'Cookie': 'connect.sid=s%3Atest-session'
      }
    });
    
    console.log('Auth response status:', authResponse.status);
    
    // Step 2: Create a post with video
    console.log('\n📤 Step 2: Creating post with video...');
    
    const form = new FormData();
    form.append('content', 'ESA LIFE CEO 56x21 - Testing video upload and display functionality! 🎥');
    form.append('isPublic', 'true');
    
    // Add the video file
    if (fs.existsSync(videoPath)) {
      form.append('media', fs.createReadStream(videoPath), 'test-video.mp4');
      console.log('✅ Added real video file to upload');
    } else {
      // Create and add a test video
      const testContent = Buffer.from('Test video content');
      form.append('media', testContent, {
        filename: 'test-video.mp4',
        contentType: 'video/mp4'
      });
      console.log('✅ Added test video to upload');
    }
    
    const uploadResponse = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'Cookie': 'connect.sid=s%3Atest-session'
      }
    });
    
    const uploadResult = await uploadResponse.json();
    console.log('\n📊 Upload Response:', JSON.stringify(uploadResult, null, 2));
    
    if (uploadResult.success && uploadResult.post) {
      console.log('\n✅ Post created successfully!');
      console.log('Post ID:', uploadResult.post.id);
      console.log('Media URLs:', uploadResult.post.mediaUrls);
      console.log('Media Embeds:', uploadResult.post.mediaEmbeds);
      console.log('Image URL:', uploadResult.post.imageUrl);
      console.log('Video URL:', uploadResult.post.videoUrl);
      
      // Step 3: Fetch the posts feed to verify
      console.log('\n📥 Step 3: Fetching posts feed to verify...');
      const feedResponse = await fetch(`${API_BASE}/api/posts/feed`, {
        credentials: 'include',
        headers: {
          'Cookie': 'connect.sid=s%3Atest-session'
        }
      });
      
      const feedResult = await feedResponse.json();
      console.log('\n📊 Feed Response:', JSON.stringify(feedResult.data?.[0], null, 2));
      
      if (feedResult.success && feedResult.data && feedResult.data.length > 0) {
        const latestPost = feedResult.data[0];
        console.log('\n🎬 Latest Post Analysis:');
        console.log('- Has mediaUrls:', !!latestPost.mediaUrls);
        console.log('- MediaUrls count:', latestPost.mediaUrls?.length || 0);
        console.log('- Has mediaEmbeds:', !!latestPost.mediaEmbeds);
        console.log('- MediaEmbeds count:', latestPost.mediaEmbeds?.length || 0);
        console.log('- Has imageUrl:', !!latestPost.imageUrl);
        console.log('- Has videoUrl:', !!latestPost.videoUrl);
        
        if (latestPost.mediaUrls && latestPost.mediaUrls.length > 0) {
          console.log('\n✅✅✅ SUCCESS! Video URLs are present in the feed!');
          console.log('Media URLs:', latestPost.mediaUrls);
          
          // Check if any URL looks like a video
          const hasVideo = latestPost.mediaUrls.some(url => 
            url.toLowerCase().endsWith('.mp4') || 
            url.toLowerCase().endsWith('.mov') ||
            url.toLowerCase().endsWith('.webm') ||
            url.toLowerCase().endsWith('.avi')
          );
          
          if (hasVideo) {
            console.log('🎥 Video file detected in media URLs!');
          }
        } else if (latestPost.mediaEmbeds && latestPost.mediaEmbeds.length > 0) {
          console.log('\n✅ Media found in mediaEmbeds field!');
          console.log('Media Embeds:', latestPost.mediaEmbeds);
        } else {
          console.log('\n⚠️ No media URLs found in the latest post');
        }
      }
    } else {
      console.error('❌ Upload failed:', uploadResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testVideoUpload().then(() => {
  console.log('\n🏁 ESA LIFE CEO 56x21 - Test Complete');
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});