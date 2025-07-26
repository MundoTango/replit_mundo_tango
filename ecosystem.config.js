module.exports = {
  apps: [{
    name: 'mundo-tango-life-ceo',
    script: './server/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    merge_logs: true,
    time: true,
    watch: false,
    max_memory_restart: '2G',
    restart_delay: 3000,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    // Life CEO 40x20s monitoring
    instance_var: 'INSTANCE_ID',
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Advanced features
    post_update: ['npm install'],
    // Monitoring
    pmx: true,
    // 40x20s Phase 4 intelligent metrics
    metrics: {
      network: true,
      ports: true,
      processes: true
    }
  }]
};