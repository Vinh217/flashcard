import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../config/database.ts';
import { Room } from '../entities/Room.ts';
import { User } from '../entities/User.ts';

const roomRepository = AppDataSource.getRepository(Room);
const userRepository = AppDataSource.getRepository(User);

interface CreateRoomData {
  username: string;
}

interface JoinRoomData {
  roomCode: string;
  username: string;
}

interface StartGameData {
  roomCode: string;
}

export const setupRoomHandlers = (io: Server, socket: Socket) => {
  // Tạo phòng mới
  socket.on('create_room', async (data: CreateRoomData) => {
    try {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Tạo phòng mới
      const room = roomRepository.create({
        code: roomCode,
        status: 'waiting'
      });
      await roomRepository.save(room);

      // Tạo người chơi đầu tiên (host)
      const host = userRepository.create({
        username: data.username,
        socket_id: socket.id,
        is_host: true,
        room: room
      });
      await userRepository.save(host);

      socket.join(room.id);

      // Gửi thông tin phòng cho người tạo
      socket.emit('room_created', {
        roomId: room.id,
        roomCode: room.code,
        players: [{
          id: host.id,
          username: host.username,
          isHost: host.is_host,
          score: host.score,
          socket_id: host.socket_id
        }]
      });

      console.log(`Room created: ${roomCode} by ${data.username}`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Tham gia phòng
  socket.on('join_room', async (data: JoinRoomData) => {
    try {
      const { roomCode, username } = data;
      
      // Tìm phòng theo mã
      const room = await roomRepository.findOne({
        where: { code: roomCode },
        relations: ['players']
      });
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.status !== 'waiting') {
        socket.emit('error', { message: 'Game already started' });
        return;
      }

      // Thêm người chơi mới
      const player = userRepository.create({
        username,
        socket_id: socket.id,
        is_host: false,
        room: room
      });
      await userRepository.save(player);

      socket.join(room.id);

      // Lấy danh sách người chơi cập nhật
      const updatedRoom = await roomRepository.findOne({
        where: { id: room.id },
        relations: ['players']
      });

      if (!updatedRoom) {
        throw new Error('Room not found after update');
      }

      console.log('room', room)
      // Gửi thông tin phòng cho người tham gia
      socket.emit('room_joined', {
        roomId: room.id,
        roomCode: room.code,
        players: updatedRoom.players.map(p => ({
          id: p.id,
          username: p.username,
          isHost: p.is_host,
          score: p.score,
          socket_id: p.socket_id
        }))
      });

      // Thông báo cho tất cả người chơi trong phòng
      io.to(room.id).emit('player_joined', {
        players: updatedRoom.players.map(p => ({
          id: p.id,
          username: p.username,
          isHost: p.is_host,
          score: p.score,
          socket_id: p.socket_id
        }))
      });

      console.log(`${username} joined room ${room.code}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Bắt đầu game
  socket.on('start_game', async (data: StartGameData) => {
    try {
      const { roomCode } = data;
      const room = await roomRepository.findOne({
        where: { code: roomCode },
        relations: ['players']
      });

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.players.length < 2) {
        socket.emit('error', { message: 'Need at least 2 players to start' });
        return;
      }

      room.status = 'playing';
      room.started_at = new Date();
      await roomRepository.save(room);

      // TODO: Lấy câu hỏi từ database
      const questions: any[] = []; // Lấy câu hỏi từ database

      io.to(room.id).emit('game_started', {
        questions
      });

      console.log(`Game started in room ${room.code}`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  // Khi người chơi ngắt kết nối
  socket.on('disconnect', async () => {
    try {
      // Tìm người chơi theo socket_id
      const player = await userRepository.findOne({
        where: { socket_id: socket.id },
        relations: ['room']
      });

      if (player) {
        const room = player.room;
        
        // Xóa người chơi
        await userRepository.remove(player);

        // Kiểm tra nếu phòng còn người chơi
        const remainingPlayers = await userRepository.count({
          where: { room: { id: room.id } }
        });

        if (remainingPlayers === 0) {
          // Xóa phòng nếu không còn người chơi
          await roomRepository.remove(room);
        } else {
          // Lấy danh sách người chơi cập nhật
          const updatedRoom = await roomRepository.findOne({
            where: { id: room.id },
            relations: ['players']
          });

          if (!updatedRoom) {
            throw new Error('Room not found after update');
          }

          // Thông báo cho người chơi còn lại
          io.to(room.id).emit('player_left', {
            players: updatedRoom.players.map(p => ({
              id: p.id,
              username: p.username,
              isHost: p.is_host,
              score: p.score,
              socket_id: p.socket_id
            }))
          });
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Lấy thông tin phòng
  socket.on('get_room_info', async (data: { roomCode: string }) => {
    try {
      const { roomCode } = data;
      
      // Tìm phòng theo mã
      const room = await roomRepository.findOne({
        where: { code: roomCode },
        relations: ['players']
      });

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Tìm người chơi hiện tại
      const currentPlayer = await userRepository.findOne({
        where: { socket_id: socket.id }
      });

      // Gửi thông tin phòng
      socket.emit('room_info', {
        players: room.players.map(p => ({
          id: p.id,
          username: p.username,
          isHost: p.is_host,
          score: p.score,
          socket_id: p.socket_id
        })),
        status: room.status,
        isHost: currentPlayer?.is_host || false
      });

      console.log(`Room info sent for room ${roomCode}`);
    } catch (error) {
      console.error('Error getting room info:', error);
      socket.emit('error', { message: 'Failed to get room info' });
    }
  });

  // Xử lý tin nhắn chat
  socket.on('chat_message', async (data: { roomCode: string; content: string }) => {
    try {
      const { roomCode, content } = data;
      
      // Tìm phòng theo mã
      const room = await roomRepository.findOne({
        where: { code: roomCode }
      });

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Tìm người gửi tin nhắn
      const sender = await userRepository.findOne({
        where: { socket_id: socket.id }
      });

      if (!sender) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Gửi tin nhắn đến tất cả người chơi trong phòng
      io.to(room.id).emit('chat_message', {
        username: sender.username,
        content,
        timestamp: Date.now()
      });

      console.log(`Chat message from ${sender.username} in room ${roomCode}`);
    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
}; 