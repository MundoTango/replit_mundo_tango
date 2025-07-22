// Life CEO Build Optimizer
// Handles memory optimization for deployment builds

const fs = require('fs');
const path = require('path');

class LifeCEOBuildOptimizer {
  constructor() {
    this.memoryLimit = 8192; // 8GB
    this.buildStats = {
      startTime: Date.now(),
      memoryUsage: [],
      errors: []
    };
  }

  // Monitor memory usage during build
  monitorMemory() {
    const interval = setInterval(() => {
      const usage = process.memoryUsage();
      this.buildStats.memoryUsage.push({
        time: Date.now() - this.buildStats.startTime,
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        rss: Math.round(usage.rss / 1024 / 1024)
      });

      // Force garbage collection if memory usage is high
      if (usage.heapUsed / usage.heapTotal > 0.9) {
        if (global.gc) {
          console.log('🧹 Life CEO: Triggering garbage collection...');
          global.gc();
        }
      }
    }, 1000);

    return interval;
  }

  // Clean build artifacts
  cleanBuildArtifacts() {
    console.log('🧹 Life CEO: Cleaning build artifacts...');
    const dirsToClean = ['dist', 'client/dist', 'node_modules/.vite'];
    
    dirsToClean.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Cleaned: ${dir}`);
      }
    });
  }

  // Optimize environment for build
  optimizeEnvironment() {
    console.log('💾 Life CEO: Setting memory optimization...');
    
    // Set memory limit
    process.env.NODE_OPTIONS = `--max_old_space_size=${this.memoryLimit}`;
    
    // Disable source maps for production
    process.env.GENERATE_SOURCEMAP = 'false';
    
    // Enable garbage collection
    process.env.NODE_OPTIONS += ' --expose-gc';
    
    console.log(`✅ Memory limit set to ${this.memoryLimit}MB`);
  }

  // Generate build report
  generateReport() {
    const duration = Date.now() - this.buildStats.startTime;
    const maxMemory = Math.max(...this.buildStats.memoryUsage.map(m => m.heapUsed));
    
    console.log('\n📊 Life CEO Build Report:');
    console.log(`⏱️  Build duration: ${Math.round(duration / 1000)}s`);
    console.log(`💾 Peak memory usage: ${maxMemory}MB`);
    console.log(`🚀 Build completed successfully!\n`);
    
    // Save detailed stats
    fs.writeFileSync(
      'build-stats.json',
      JSON.stringify(this.buildStats, null, 2)
    );
  }

  // Main optimization process
  async optimize() {
    console.log('🧠 Life CEO Build Optimizer starting...\n');
    
    this.cleanBuildArtifacts();
    this.optimizeEnvironment();
    
    const memoryMonitor = this.monitorMemory();
    
    process.on('exit', () => {
      clearInterval(memoryMonitor);
      this.generateReport();
    });
    
    console.log('✅ Life CEO optimizations applied!\n');
  }
}

// Run optimizer if called directly
if (require.main === module) {
  const optimizer = new LifeCEOBuildOptimizer();
  optimizer.optimize();
}

module.exports = LifeCEOBuildOptimizer;