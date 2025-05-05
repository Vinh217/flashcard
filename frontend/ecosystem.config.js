module.exports = {
  apps: [
    {
      name: "flashcard",           // Tên ứng dụng
      script: "npm",                   // Lệnh để chạy
      args: "start",                   // Tham số đi kèm cho lệnh
      instances: 1,                    // Số instance để chạy, bạn có thể dùng 'max' để tối đa hóa số core CPU
      autorestart: true,
      exec_mode: 'fork',
      watch: false,                    // Không theo dõi file thay đổi để restart tự động
      max_memory_restart: "1G",        // Restart nếu ứng dụng vượt quá 1GB bộ nhớ
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
    },
  ],
};
