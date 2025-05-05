# Hướng dẫn deploy backend bằng PM2

## Các bước chuẩn bị

1. Cài đặt Node.js (v16 hoặc cao hơn) và npm
2. Cài đặt PM2 toàn cục: `npm install -g pm2`
3. Cài đặt và cấu hình MySQL

## Các bước triển khai

1. Sao chép file `.env.example` thành `.env` và cấu hình các biến môi trường cần thiết:
   ```bash
   cp .env.example .env
   nano .env  # hoặc sử dụng trình soạn thảo khác để chỉnh sửa
   ```

2. Cài đặt các dependency:
   ```bash
   npm install
   ```

3. Biên dịch TypeScript thành JavaScript:
   ```bash
   npm run build
   ```

4. Khởi động ứng dụng với PM2:
   ```bash
   npm run pm2:start
   ```

## Quản lý ứng dụng

- Xem danh sách các ứng dụng PM2: `pm2 list`
- Xem logs: `pm2 logs flashcard-backend`
- Khởi động lại ứng dụng: `npm run pm2:restart`
- Dừng ứng dụng: `npm run pm2:stop`
- Xóa ứng dụng khỏi PM2: `npm run pm2:delete`

## Cấu hình tự động khởi động khi máy chủ khởi động lại

```bash
pm2 startup
```

Sau đó chạy lệnh mà PM2 cung cấp và lưu cấu hình hiện tại:

```bash
pm2 save
```

## Xử lý sự cố

- Nếu gặp lỗi kết nối cơ sở dữ liệu, hãy kiểm tra các biến `DB_*` trong file `.env`
- Nếu socket.io không hoạt động, kiểm tra `CLIENT_URL` đã đúng chưa
- Để xem logs chi tiết: `pm2 logs flashcard-backend --lines 200`