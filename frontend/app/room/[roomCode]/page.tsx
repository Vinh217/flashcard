'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/app/context/SocketContext';
import { useGameStore } from '@/app/store/useGameStore';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { FiUserPlus, FiMessageCircle, FiPlay, FiLogOut } from 'react-icons/fi';
import BackgroundBubbles from '@/app/components/BackgroundBubbles';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { roomCode, roomId, players, isHost, setRoomInfo, updatePlayers } = useGameStore();
  
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{
    username: string;
    content: string;
    timestamp: number;
  }>>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Confirm we have a room code
  const currentRoomCode = (params.roomCode as string) || roomCode;

  useEffect(() => {
    if (!socket || !isConnected) return;

    // If we don't have room info yet (e.g. direct URL access), get it from the server
    if (!roomId) {
      socket.emit('get_room_info', { roomCode: currentRoomCode });
    }

    // Set up room event listeners
    socket.on('room_info', (data) => {
      setRoomInfo({
        roomId: data.roomId || roomId,
        roomCode: currentRoomCode || '',
        players: data.players,
        isHost: data.isHost,
        status: data.status
      });
    });

    socket.on('player_joined', (data) => {
      updatePlayers(data.players);
    });

    socket.on('player_left', (data) => {
      updatePlayers(data.players);
    });

    socket.on('chat_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('game_started', () => {
      router.push(`/room/${currentRoomCode}/game`);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('room_info');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('chat_message');
      socket.off('game_started');
    };
  }, [socket, isConnected, currentRoomCode, roomId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const startGame = () => {
    if (!socket || !isConnected) {
      setError('Connection error. Please try again.');
      return;
    }

    setIsStarting(true);
    setError(null);

    socket.emit('start_game', { roomCode: currentRoomCode });

    socket.once('error', (data) => {
      setIsStarting(false);
      setError(data.message || 'Failed to start game');
    });
  };

  const sendMessage = () => {
    if (chatInput.trim() && socket) {
      socket.emit('chat_message', {
        roomCode,
        content: chatInput.trim()
      });
      setChatInput('');
    }
  };

  const leaveRoom = () => {
    router.push('/multiplayer');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoomCode || '');
  };

  if (!currentRoomCode) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p>Room not found. Please return to the multiplayer page.</p>
        <Button 
          variant="outline" 
          onClick={() => router.push('/multiplayer')}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bubble-gradient overflow-hidden flex items-center justify-center">
      <BackgroundBubbles />
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Room Info Section */}
          <div className="md:col-span-1 bg-bubble-dark/80 border-2 border-bubble-blue rounded-2xl shadow-bubble p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Room</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={copyRoomCode}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200"
                >
                  Copy Code
                </Button>
                <Button 
                  variant="outline" 
                  onClick={leaveRoom}
                  className="bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
                >
                  <FiLogOut />
                </Button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6 flex justify-center border border-blue-100">
              <span className="text-2xl font-mono font-bold tracking-wider text-blue-600">
                {currentRoomCode}
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
                <FiUserPlus className="mr-2 text-blue-500" /> Players ({players.length})
              </h3>
              <ul className="divide-y divide-gray-100">
                {players.map(player => (
                  <li key={player.id} className="py-3 flex justify-between items-center transition-colors duration-200 px-2 rounded">
                    <span className="font-medium">{player.username}</span>
                    {player.isHost && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Host</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            {isHost && (
              <Button 
                variant="bubble"
                onClick={startGame}
                disabled={isStarting || players.length < 2}
                className="w-full flex items-center justify-center font-bold rounded-xl py-3 shadow-md"
              >
                <FiPlay className="mr-2" />
                {isStarting ? 'Starting...' : 'Start Game'}
              </Button>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-fade-in">
                {error}
              </div>
            )}
          </div>
          
          {/* Chat Section */}
          <div className="md:col-span-2 bg-bubble-dark/80 border-2 border-bubble-blue rounded-2xl shadow-bubble p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <FiMessageCircle className="mr-2" /> Chat
            </h2>
            
            <div 
              ref={chatContainerRef}
              className="flex-grow overflow-y-auto mb-4 max-h-96 bg-gray-50 rounded-lg p-4 border border-gray-100"
            >
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No messages yet. Say hello!
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between">
                        <span className="font-semibold text-blue-600">{msg.username}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-700">{msg.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!isConnected}
                className="w-full bg-[#2d0665] border border-[#5ce1e6] text-[#22223b] placeholder-[#a084e8] rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#5ce1e6] focus:outline-none shadow-sm"
              />
              <Button 
                variant="bubble" 
                onClick={sendMessage} 
                disabled={!isConnected}
                className="bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 