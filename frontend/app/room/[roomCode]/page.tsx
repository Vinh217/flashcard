'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/app/context/SocketContext';
import { useGameStore } from '@/app/store/useGameStore';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { FiUserPlus, FiMessageCircle, FiPlay, FiLogOut } from 'react-icons/fi';

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
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room Info Section */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Room</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={copyRoomCode}
              >
                Copy Code
              </Button>
              <Button 
                variant="outline" 
                onClick={leaveRoom}
              >
                <FiLogOut />
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-lg mb-6 flex justify-center">
            <span className="text-2xl font-mono font-bold tracking-wider">
              {currentRoomCode}
            </span>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FiUserPlus className="mr-2" /> Players ({players.length})
            </h3>
            <ul className="divide-y divide-gray-200">
              {players.map(player => (
                <li key={player.id} className="py-3 flex justify-between items-center">
                  <span>{player.username}</span>
                  {player.isHost && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Host</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {isHost && (
            <Button 
              variant="outline"
              onClick={startGame}
              disabled={isStarting || players.length < 2}
              className="w-full flex items-center justify-center"
            >
              <FiPlay className="mr-2" />
              {isStarting ? 'Starting...' : 'Start Game'}
            </Button>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Chat Section */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FiMessageCircle className="mr-2" /> Chat
          </h2>
          
          <div 
            ref={chatContainerRef}
            className="flex-grow overflow-y-auto mb-4 max-h-96 bg-gray-50 rounded-lg p-4"
          >
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                No messages yet. Say hello!
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">{msg.username}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1">{msg.content}</p>
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
            />
            <Button variant="outline" onClick={sendMessage} disabled={!isConnected}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 