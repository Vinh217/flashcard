import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Xử lý khi client tạo phòng
    socket.on('create_room', (data) => {
      console.log('Create room:', data);
      // TODO: Xử lý tạo phòng
    });

    // Xử lý khi client tham gia phòng
    socket.on('join_room', (data) => {
      console.log('Join room:', data);
      // TODO: Xử lý tham gia phòng
    });

    // Xử lý khi client gửi câu trả lời
    socket.on('submit_answer', (data) => {
      console.log('Submit answer:', data);
      // TODO: Xử lý câu trả lời
    });

    // Xử lý khi client ngắt kết nối
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}; 