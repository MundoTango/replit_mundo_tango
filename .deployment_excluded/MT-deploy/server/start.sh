#!/bin/bash
# ESA LIFE CEO 56x21 - Start server with optimized memory settings
NODE_ENV=development node --max-old-space-size=4096 --expose-gc -r tsx server/index.ts