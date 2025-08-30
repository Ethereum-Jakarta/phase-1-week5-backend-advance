// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'gateway',
      script: 'src/index.ts',
      interpreter: 'bun',
      cwd: './gateway',
      env: {
        PORT: 8000,
        NODE_ENV: 'development'
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      health_check: {
        url: 'http://localhost:8000/health'
      },
      // Enhanced logging configuration
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      combine_logs: true,
      time: true,
      log_type: 'json',
      max_logs: '10',
      // Better monitoring settings
      monitoring: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      max_memory_restart: "500M",
      // Add these for better process management
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 3000
    },
    {
      name: 'user-service',
      script: 'src/index.ts',
      interpreter: 'bun',
      cwd: './services/user-service',
      env: {
        PORT: 3000,
        NODE_ENV: 'development'
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      health_check: {
        url: 'http://localhost:3000/health'
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      combine_logs: true,
      time: true,
      log_type: 'json',
      max_logs: '10',
      monitoring: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      max_memory_restart: "500M",
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 3000
    },
    {
      name: 'product-service',
      script: 'src/index.ts',
      interpreter: 'bun',
      cwd: './services/product-service',
      env: {
        PORT: 3001,
        NODE_ENV: 'development'
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      health_check: {
        url: 'http://localhost:3001/health'
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      combine_logs: true,
      time: true,
      log_type: 'json',
      max_logs: '10',
      monitoring: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      max_memory_restart: "500M",
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 3000
    },
    {
      name: 'order-service',
      script: 'src/index.ts',
      interpreter: 'bun',
      cwd: './services/order-service',
      env: {
        PORT: 3002,
        NODE_ENV: 'development'
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      health_check: {
        url: 'http://localhost:3002/health'
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      combine_logs: true,
      time: true,
      log_type: 'json',
      max_logs: '10',
      monitoring: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      max_memory_restart: "500M",
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 3000
    },
    {
      name: 'monitor',
      script: 'health-check.ts',
      interpreter: 'bun',
      cwd: './monitor',
      env: {
        PORT: 3500,
        NODE_ENV: 'development'
      },
      watch: ['src'],
      ignore_watch: ['node_modules', 'logs'],
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      combine_logs: true,
      time: true,
      log_type: 'json',
      max_logs: '10',
      monitoring: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      max_memory_restart: "500M",
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 3000
    }
  ]
};