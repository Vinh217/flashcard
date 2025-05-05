module.exports = {
  apps: [{
    name: "flashcard-backend",
    script: "src/index.ts",
    interpreter: "node",
    interpreter_args: "--loader ts-node/esm",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 5000,
      CLIENT_URL: "http://localhost:3000" // Thay đổi URL này khi frontend được triển khai
    }
  }]
}; 