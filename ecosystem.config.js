module.exports = {
  apps: [{
    name: 'nla-app',
    script: 'npm',
    args: 'start',
    env: {
      PORT: 3000,
      NODE_ENV: 'production'
    },
    env_production: {
      PORT: 3000,
      NODE_ENV: 'production'
    }
  }]
} 