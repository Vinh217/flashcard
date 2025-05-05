import { AppDataSource } from '../config/database.js';
import { Room } from '../entities/Room.js';
import { User } from '../entities/User.js';
import { RoomUser } from '../entities/RoomUser.js';
const roomRepository = AppDataSource.getRepository(Room);
const userRepository = AppDataSource.getRepository(User);
const roomUserRepository = AppDataSource.getRepository(RoomUser);
// Helper function to transform User to Player object for client
const mapToPlayer = (user, roomUser) => ({
    id: user.id,
    username: user.username,
    isHost: user.is_host,
    score: roomUser.score,
    socket_id: user.socket_id
});
// Helper to get all players in a room
const getPlayersInRoom = async (roomId) => {
    const roomUsers = await roomUserRepository.find({
        where: { room_id: roomId },
        relations: ['user']
    });
    return roomUsers.map(ru => mapToPlayer(ru.user, ru));
};
export const setupRoomHandlers = (io, socket) => {
    // Tạo phòng mới
    socket.on('create_room', async (data) => {
        try {
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            // Tạo phòng mới
            const room = roomRepository.create({
                code: roomCode,
                status: 'waiting'
            });
            await roomRepository.save(room);
            // Tạo người dùng mới (hoặc tìm người dùng hiện có)
            let user = await userRepository.findOne({
                where: { username: data.username }
            });
            if (!user) {
                user = userRepository.create({
                    username: data.username,
                    is_host: true,
                    socket_id: socket.id
                });
            }
            else {
                user.is_host = true;
                user.socket_id = socket.id;
            }
            await userRepository.save(user);
            // Tạo liên kết giữa người dùng và phòng
            const roomUser = roomUserRepository.create({
                room_id: room.id,
                user_id: user.id,
                score: 0
            });
            await roomUserRepository.save(roomUser);
            socket.join(room.id);
            // Gửi thông tin phòng cho người tạo
            socket.emit('room_created', {
                roomId: room.id,
                roomCode: room.code,
                players: [mapToPlayer(user, roomUser)]
            });
            console.log(`Room created: ${roomCode} by ${data.username}`);
        }
        catch (error) {
            console.error('Error creating room:', error);
            socket.emit('error', { message: 'Failed to create room' });
        }
    });
    // Tham gia phòng
    socket.on('join_room', async (data) => {
        try {
            const { roomCode, username } = data;
            // Tìm phòng theo mã
            const room = await roomRepository.findOne({
                where: { code: roomCode }
            });
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }
            if (room.status !== 'waiting') {
                socket.emit('error', { message: 'Game already started' });
                return;
            }
            // Tạo hoặc tìm người dùng
            let user = await userRepository.findOne({
                where: { username }
            });
            if (!user) {
                user = userRepository.create({
                    username,
                    is_host: false,
                    socket_id: socket.id
                });
            }
            else {
                user.socket_id = socket.id;
            }
            await userRepository.save(user);
            // Kiểm tra xem người dùng đã trong phòng chưa
            const existingRoomUser = await roomUserRepository.findOne({
                where: {
                    room_id: room.id,
                    user_id: user.id
                }
            });
            if (!existingRoomUser) {
                // Tạo liên kết mới giữa người dùng và phòng
                const roomUser = roomUserRepository.create({
                    room_id: room.id,
                    user_id: user.id,
                    score: 0
                });
                await roomUserRepository.save(roomUser);
            }
            socket.join(room.id);
            // Lấy danh sách người chơi trong phòng
            const players = await getPlayersInRoom(room.id);
            // Gửi thông tin phòng cho người tham gia
            socket.emit('room_joined', {
                roomId: room.id,
                roomCode: room.code,
                players
            });
            // Thông báo cho tất cả người chơi trong phòng
            io.to(room.id).emit('player_joined', {
                players
            });
            console.log(`${username} joined room ${room.code}`);
        }
        catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    });
    // Bắt đầu game
    socket.on('start_game', async (data) => {
        try {
            const { roomCode } = data;
            const room = await roomRepository.findOne({
                where: { code: roomCode }
            });
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }
            // Đếm số lượng người chơi trong phòng
            const playerCount = await roomUserRepository.count({
                where: { room_id: room.id }
            });
            if (playerCount < 2) {
                socket.emit('error', { message: 'Need at least 2 players to start' });
                return;
            }
            // Cập nhật trạng thái phòng
            room.status = 'playing';
            room.started_at = new Date();
            await roomRepository.save(room);
            // TODO: Lấy câu hỏi từ database
            const questions = []; // Lấy câu hỏi từ database
            io.to(room.id).emit('game_started', {
                questions
            });
            console.log(`Game started in room ${room.code}`);
        }
        catch (error) {
            console.error('Error starting game:', error);
            socket.emit('error', { message: 'Failed to start game' });
        }
    });
    // Khi người chơi ngắt kết nối
    socket.on('disconnect', async () => {
        try {
            // Tìm người chơi theo socket_id
            const user = await userRepository.findOne({
                where: { socket_id: socket.id }
            });
            if (user) {
                // Tìm các phòng mà người dùng tham gia
                const roomUser = await roomUserRepository.findOne({
                    where: { user_id: user.id },
                    relations: ['room']
                });
                if (roomUser) {
                    const roomId = roomUser.room_id;
                    // Xóa liên kết giữa người dùng và phòng
                    await roomUserRepository.remove(roomUser);
                    // Kiểm tra nếu phòng còn người chơi
                    const remainingPlayers = await roomUserRepository.count({
                        where: { room_id: roomId }
                    });
                    if (remainingPlayers === 0) {
                        // Xóa phòng nếu không còn người chơi
                        const room = await roomRepository.findOne({
                            where: { id: roomId }
                        });
                        if (room) {
                            await roomRepository.remove(room);
                        }
                    }
                    else {
                        // Lấy danh sách người chơi cập nhật
                        const players = await getPlayersInRoom(roomId);
                        // Thông báo cho người chơi còn lại
                        io.to(roomId).emit('player_left', {
                            players
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
    // Lấy thông tin phòng
    socket.on('get_room_info', async (data) => {
        try {
            const { roomCode } = data;
            // Tìm phòng theo mã
            const room = await roomRepository.findOne({
                where: { code: roomCode }
            });
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }
            // Lấy danh sách người chơi trong phòng
            const players = await getPlayersInRoom(room.id);
            // Tìm thông tin người chơi hiện tại
            const currentUser = await userRepository.findOne({
                where: { socket_id: socket.id }
            });
            // Gửi thông tin phòng
            socket.emit('room_info', {
                roomId: room.id,
                roomCode: room.code,
                players,
                status: room.status,
                isHost: currentUser?.is_host || false
            });
            console.log(`Room info sent for room ${roomCode}`);
        }
        catch (error) {
            console.error('Error getting room info:', error);
            socket.emit('error', { message: 'Failed to get room info' });
        }
    });
    // Xử lý tin nhắn chat
    socket.on('chat_message', async (data) => {
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
            const user = await userRepository.findOne({
                where: { socket_id: socket.id }
            });
            if (!user) {
                socket.emit('error', { message: 'User not found' });
                return;
            }
            // Gửi tin nhắn đến tất cả người chơi trong phòng
            io.to(room.id).emit('chat_message', {
                username: user.username,
                content,
                timestamp: Date.now()
            });
            console.log(`Chat message from ${user.username} in room ${roomCode}`);
        }
        catch (error) {
            console.error('Error handling chat message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });
};
