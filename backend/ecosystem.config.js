module.exports = {
  apps: [{
    name: "flashcard-backend",
    script: "dist/index.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3010,
      CLIENT_URL: "https://changangon.site",
      DB_PORT: 3306,
      MYSQL_USER: "game_user",
      MYSQL_PASSWORD: "root123",
      MYSQL_DATABASE: "flashcard_game",
      MYSQL_ROOT_PASSWORD: "root123",
      DB_HOST: "localhost"
    }
  }]
}; 