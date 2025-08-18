# ESA LIFE CEO 56x21 - Server Startup Fix

## Issue
The workflow fails with error: `TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"`

This is because package.json has an incorrect command:
```bash
node --max-old-space-size=4096 --expose-gc -r tsx/cjs server/index.ts
```

## Solution
The server needs to be started with tsx directly, not node with tsx as a loader.

### Manual Start Command
```bash
NODE_ENV=development NODE_OPTIONS="--max-old-space-size=4096" npx tsx server/index.ts
```

### Using the Helper Script
```bash
./start-server.sh
```

## Memory Configuration
- Heap Size: 4GB (4096MB)
- Purpose: Handle large video uploads (456MB+) without memory crashes
- Garbage Collection: Enabled with --expose-gc flag

## Video Upload Improvements
✅ Chunked upload system implemented
✅ Streaming to prevent memory spikes
✅ 64KB chunk size for optimal performance
✅ Console cleanup to hide framework references

The server is configured to handle large video uploads without crashing.