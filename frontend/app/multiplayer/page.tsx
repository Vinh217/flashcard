'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useGameStore } from '../store/useGameStore';

export default function MultiplayerPage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { setRoomInfo } = useGameStore();
  
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!socket || !isConnected) {
      setError('Connection error. Please try again.');
      return;
    }

    setIsCreating(true);
    setError(null);

    socket.emit('create_room', { username });

    socket.once('room_created', (data) => {
      setIsCreating(false);
      
      // Save room info to store
      setRoomInfo({
        roomId: data.roomId,
        roomCode: data.roomCode,
        players: data.players,
        isHost: true
      });
      
      // Navigate to room page
      router.push(`/room/${data.roomCode}`);
    });

    socket.once('error', (data) => {
      setIsCreating(false);
      setError(data.message || 'Failed to create room');
    });
  };

  const joinRoom = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    if (!socket || !isConnected) {
      setError('Connection error. Please try again.');
      return;
    }

    setIsJoining(true);
    setError(null);

    socket.emit('join_room', { username, roomCode });

    socket.once('room_joined', (data) => {
      setIsJoining(false);
      
      // Save room info to store
      setRoomInfo({
        roomId: data.roomId,
        roomCode: data.roomCode,
        players: data.players,
        isHost: false
      });
      
      // Navigate to room page
      router.push(`/room/${data.roomCode}`);
    });

    socket.once('error', (data) => {
      setIsJoining(false);
      setError(data.message || 'Failed to join room');
    });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Flashcard Game - Multiplayer</h1>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button 
            variant="outline"
            onClick={createRoom}
            disabled={isCreating || !isConnected}
             className="col-span-2"
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </Button>
          
          <div className="col-span-2 flex items-center justify-center">
            <div className="border-t border-gray-300 flex-grow mx-4"></div>
            <span className="text-gray-500">OR</span>
            <div className="border-t border-gray-300 flex-grow mx-4"></div>
          </div>
          
          <div className="col-span-2 mb-4">
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
              Room Code
            </label>
            <Input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full"
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={joinRoom}
            disabled={isJoining || !isConnected}
            className="col-span-2"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {!isConnected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
            Connecting to server...
          </div>
        )}
      </div>
    </div>
  );
} 