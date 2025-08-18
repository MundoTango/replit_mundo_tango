# ESA LIFE CEO 61x21 Deployment Instructions

## ⚠️ IMPORTANT: Use Reserved VM Deployment (Not Autoscale)

### Why Reserved VM?
Our platform runs continuous background activities that are incompatible with Autoscale:
- Life CEO Continuous Validation (every 30 seconds)
- Performance monitoring and anomaly detection
- Cache warming and optimization loops
- Admin statistics processing
- Real-time WebSocket connections

### Deployment Steps:

1. **In Replit Deployments Panel:**
   - Click "Deploy" button
   - Choose **"Reserved VM"** (NOT Autoscale)
   - Select appropriate machine size (recommend at least 2 vCPU, 2GB RAM)

2. **Configuration:**
   - Build command: `npm run build`
   - Run command: `npm run start`
   - Port: 5000

3. **Environment Variables:**
   All secrets are already configured and will transfer automatically:
   - DATABASE_URL
   - VITE_CLOUDINARY_API_KEY
   - VITE_CLOUDINARY_API_SECRET
   - SESSION_SECRET
   - etc.

4. **Expected Behavior:**
   - Provisioning should complete within 2-5 minutes
   - Single instance will run on dedicated VM
   - Background processes will work correctly
   - No disruption from auto-scaling

### If Still Stuck:

1. **Cancel current deployment** and start fresh with Reserved VM
2. **Check logs** for any build errors
3. **Contact Support** if Reserved VM also gets stuck

### Post-Deployment:
- Monitor the deployment logs
- Verify all background services are running
- Test upload functionality
- Check database connectivity

---
*Following ESA Framework Phase 20: Production Deployment*