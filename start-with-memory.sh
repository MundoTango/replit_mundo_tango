#!/bin/bash
# ESA LIFE CEO 56x21 - Memory Fix for Large Routes File
# This script increases Node.js heap size to handle the 17,175 line routes.ts file

echo "🚀 ESA LIFE CEO 56x21 - Starting server with increased memory allocation..."
echo "📊 Allocating 8GB heap space to handle large route file..."

# Set Node.js options for increased memory
export NODE_OPTIONS="--max-old-space-size=8192"
export NODE_ENV="development"

# Enable garbage collection logging for debugging
export NODE_OPTIONS="$NODE_OPTIONS --expose-gc"

# Start the development server
echo "🔄 Starting application with enhanced memory configuration..."
exec npx tsx server/index.ts