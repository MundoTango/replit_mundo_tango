# Cloudinary Video Upload Configuration

## ✅ Integration Complete

Your Cloudinary integration is now ready! Based on your account:
- **Cloud Name**: `dwlfq9gec`
- **Upload Preset**: `Replit` (configured as Unsigned)

## 🚀 How It Works

1. **Direct Browser Uploads**: Videos upload directly from user's browser to Cloudinary
2. **Zero Server Memory**: Server never touches the video data
3. **Automatic Optimization**: Cloudinary optimizes videos for streaming
4. **No Size Limits**: Handle videos of any size (within your Cloudinary plan)

## 📋 Required Environment Variables

Please add these to your Replit Secrets (click the lock icon in the sidebar):

```
VITE_CLOUDINARY_CLOUD_NAME=dwlfq9gec
VITE_CLOUDINARY_UPLOAD_PRESET=Replit
```

## 🎥 Features Enabled

- **Direct Cloud Upload Button**: Users can upload videos/images directly to Cloudinary
- **YouTube/Vimeo URL Support**: Users can still paste existing video URLs
- **Hybrid Approach**: Supports both cloud uploads and URL embeds
- **Progress Tracking**: Real-time upload progress display
- **Automatic Thumbnails**: Generated for video previews

## 📊 Your Cloudinary Free Tier Includes

- 25 GB Storage
- 25 GB Bandwidth per month
- Automatic video optimization
- CDN delivery worldwide
- No file size limits on uploads

## 🔧 Testing the Feature

1. Navigate to the post creator
2. Click "Upload Video/Image to Cloud" button
3. Select a video file
4. Watch the progress bar as it uploads
5. Video will be automatically optimized and ready for streaming

## 🔒 Security

- Using **Unsigned Upload Preset** for direct browser uploads
- No server involvement = no memory crashes
- Videos served from Cloudinary's secure CDN
- API Secret stored securely (not used for unsigned uploads)

## 📝 Notes

- The upload button will show "Cloud upload not configured" until the environment variables are added
- After adding secrets, refresh the page to activate the feature
- Large videos may take time to upload depending on internet speed