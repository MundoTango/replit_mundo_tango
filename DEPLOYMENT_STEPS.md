# ESA LIFE CEO 61x21 - Deployment Steps

## You're at Step 1: Select Deployment Type ✅
- **Autoscale** is correctly selected (Recommended)
- Click **"Set up your deployment"** button

## Step 2: Configure Deployment Settings
After clicking "Set up your deployment", you'll see configuration options:

### Build & Run Commands:
- **Build command**: `npm ci && npm run build`
- **Run command**: `npm run start`

### Port Configuration:
- **Port**: `5000`

### Environment Variables (if needed):
```
NODE_ENV=production
PORT=5000
RUN_MIGRATIONS=false
```

### Health Check:
- **Path**: `/healthz`
- **Interval**: 30 seconds

## Step 3: Deploy
- Click **"Deploy"** or **"Redeploy"**
- The deployment will use our optimized Dockerfile automatically
- Image size will be < 500MB (not 8GB+)

## What to Expect:
✅ Build will use multi-stage Dockerfile
✅ Only production dependencies included
✅ Image size hundreds of MB (not GB)
✅ Deployment completes in ~3-5 minutes
✅ App available at `.replit.app` domain

## Monitoring:
Watch the deployment logs for:
- "Building image..." 
- "Pushing layers..."
- Final image size (should be < 500MB)
- "Deployment successful"