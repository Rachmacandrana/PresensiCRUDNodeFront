module.exports = {
  apps: [
    {
      name: "presensi-aqua",
      script: "./backend/app.js", // sesuaikan path
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
