'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../context/SocketContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useGameStore } from '../store/useGameStore';
import Loading from '@/app/components/Loading';
import BackgroundBubbles from '@/app/components/BackgroundBubbles';

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
    <div className="relative min-h-screen bg-bubble-gradient overflow-hidden flex items-center justify-center">
      <BackgroundBubbles />
      <div className="max-w-md w-full mx-auto flex flex-col items-center relative z-10">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#a084e8]">Flashcard Game - Multiplayer</h1>
        <div className="w-full bg-[#3d1a7a] border-2 border-[#5ce1e6] rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-[#e0e0e0] mb-2">
              Your Name
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-[#2d0665] border border-[#5ce1e6] text-[#22223b] placeholder-[#a084e8] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#5ce1e6] focus:outline-none shadow-sm"
            />
          </div>
          <Button 
            variant="bubble"
            onClick={createRoom}
            disabled={isCreating || !isConnected}
            className="w-full mb-6 rounded-xl font-bold py-3 shadow-md"
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </Button>
          <div className="flex items-center justify-center my-4">
            <div className="border-t border-[#a084e8] flex-grow mx-4"></div>
            <span className="text-[#a084e8] px-4">OR</span>
            <div className="border-t border-[#a084e8] flex-grow mx-4"></div>
          </div>
          <div className="mb-6">
            <label htmlFor="roomCode" className="block text-sm font-medium text-[#e0e0e0] mb-2">
              Room Code
            </label>
            <Input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full bg-[#2d0665] border border-[#5ce1e6] text-[#22223b] placeholder-[#a084e8] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#5ce1e6] focus:outline-none shadow-sm"
            />
          </div>
          <Button 
            variant="bubble" 
            onClick={joinRoom}
            disabled={isJoining || !isConnected}
            className="w-full rounded-xl font-bold py-3 shadow-md"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </Button>
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-fade-in">
              {error}
            </div>
          )}
          {!isConnected && (
            <div className="mt-6 flex justify-center">
              <Loading text="Connecting to server..." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 