# 23L Framework: Preview Update Troubleshooting Guide
## Preventing and Fixing Preview Update Issues

### Layer 1: Understanding the Preview Update Chain
When making CSS or styling changes, the preview might not update due to multiple caching layers:
1. **Service Worker Cache** - Caches static assets for offline functionality
2. **Browser Cache** - Standard HTTP caching
3. **Vite HMR Cache** - Hot Module Replacement might not trigger for CSS variables
4. **CDN/Proxy Cache** - Replit's infrastructure caching

### Layer 2: Systematic Diagnosis Steps
1. Check browser console for HMR updates: `[vite] hmr update`
2. Verify service worker version in Application tab
3. Check Network tab for 304 (Not Modified) responses
4. Inspect CSS variables in Elements > Computed styles

### Layer 3: Fix Implementation Checklist
#### Step 1: Force Service Worker Update
```javascript
// Increment cache version in service-worker.js
const CACHE_NAME = 'life-ceo-v[INCREMENT]';
```

#### Step 2: Update CSS Imports
- Add version query parameter to force reload:
```javascript
import './index.css?v=' + Date.now();
```

#### Step 3: Clear All Caches
```javascript
// Add to your fix routine
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}
```

#### Step 4: Force Vite Restart
- Save a dummy change to vite.config.ts
- Or restart the workflow manually

### Layer 4: Prevention Strategies
1. **Use CSS Custom Properties** - They update more reliably than Tailwind classes
2. **Implement Cache Busting** - Add version hashes to CSS files
3. **Configure Vite Properly**:
```javascript
// vite.config.ts
export default {
  server: {
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  }
}
```

### Layer 5: Quick Fix Commands
```bash
# Force refresh all caches
rm -rf node_modules/.vite
# Restart the dev server
npm run dev
```

### Layer 6: Verification Steps
1. Open DevTools > Network > Disable cache
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Check Application > Service Workers > Update
4. Verify CSS variables in computed styles

### Layer 7: Common Pitfalls
- Not updating ALL instances of hardcoded colors
- Missing Tailwind purge configuration
- Service worker serving stale CSS
- Browser extensions interfering with updates

### Layer 8: Emergency Recovery
If preview still doesn't update:
1. Close all browser tabs
2. Clear browser data for the domain
3. Restart the Replit workspace
4. Open in incognito/private mode

### Integration with 23L Framework
Add this as Layer 24: Preview Update Assurance
- Run verification after every styling change
- Include cache-busting in deployment checklist
- Monitor for stale content indicators