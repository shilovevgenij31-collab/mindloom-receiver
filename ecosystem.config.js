// PM2 конфиг — используется только на сервере (не нужен для локальной разработки)
module.exports = {
  apps: [
    {
      name: 'mindloom-receiver',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/opt/mindloom-receiver',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3100,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/mindloom-receiver/error.log',
      out_file: '/var/log/mindloom-receiver/out.log',
    },
  ],
};
