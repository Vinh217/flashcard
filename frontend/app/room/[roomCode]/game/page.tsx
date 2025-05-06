'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/app/context/SocketContext';
import { useGameStore } from '@/app/store/useGameStore';
import { Button } from '@/app/components/ui/button';
import { FiClock, FiCheck, FiX, FiAward } from 'react-icons/fi';
import Loading from '@/app/components/Loading';
import CorrectAnswerAnimation from '@/app/components/CorrectAnswerAnimation';
import BackgroundBubbles from '@/app/components/BackgroundBubbles';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const { 
    roomCode: storeRoomCode, 
    questions, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    setUserAnswer,
    setQuestions,
    setGameResults,
    gameResults
  } = useGameStore();
  
  const roomCode = (params.roomCode as string) || storeRoomCode;
  
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentMaxScore, setCurrentMaxScore] = useState(100);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Setup game event listeners
    socket.on('question', (data) => {
      setQuestions(data.questions);
      setTimeLeft(data.timeLeft);
      setCurrentMaxScore(data.maxScore);
      setShowCorrectAnimation(false);
    });
    
    socket.on('next_question', (data) => {
      setCurrentQuestionIndex(data.questionIndex);
      setTimeLeft(data.timeLeft);
      setCurrentMaxScore(data.maxScore);
      setSelectedOption(null);
      setHasAnswered(false);
      setShowCorrectAnimation(false);
    });
    
    socket.on('time_update', (data) => {
      if (!hasAnswered) {
        setTimeLeft(data.timeLeft);
        setCurrentMaxScore(data.currentMaxScore);
      }
    });
    
    socket.on('answer_result', (data) => {
      if (selectedOption) {
        setUserAnswer(data.questionId, selectedOption, data.isCorrect);
      }
    });
    
    socket.on('game_results', (data) => {
      setGameResults(data.results);
      setShowResults(true);
    });
    
    // Cleanup listeners on unmount
    return () => {
      socket.off('question');
      socket.off('next_question');
      socket.off('time_update');
      socket.off('answer_result');
      socket.off('game_results');
    };
  }, [socket, isConnected, selectedOption]);
  
  // If no questions are available and we're connected, request to start the game
  useEffect(() => {
    if (socket && isConnected && questions.length === 0 && !showResults) {
      // Wait a moment to make sure socket connection is fully established
      const timer = setTimeout(() => {
        socket.emit('start_game', { roomCode });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [socket, isConnected, questions.length, roomCode, showResults]);
  
  const handleSelectOption = (optionId: string, event: React.MouseEvent) => {
    if (hasAnswered || timeLeft === 0) return;
    
    setSelectedOption(optionId);
    setHasAnswered(true);
    
    // Send answer to server
    if (socket && isConnected && currentQuestion) {
      socket.emit('submit_answer', {
        roomCode,
        questionId: currentQuestion.id,
        optionId
      });

      // Check if the answer is correct and show animation
      const isCorrect = currentQuestion.options.find(opt => opt.id === optionId)?.isCorrect;
      if (isCorrect) {
        setAnimationPosition({
          x: event.clientX,
          y: event.clientY
        });
        setShowCorrectAnimation(true);
      }
    }
  };
  
  const handleAnimationComplete = () => {
    setShowCorrectAnimation(false);
  };
  
  const returnToLobby = () => {
    router.push(`/room/${roomCode}`);
  };
  
  if (showResults) {
    return (
      <div className="relative min-h-screen bg-bubble-gradient overflow-hidden flex items-center justify-center">
        <BackgroundBubbles />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="max-w-3xl mx-auto bg-bubble-dark/80 border-2 border-bubble-blue rounded-2xl shadow-bubble p-8">
            <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <FiAward className="mr-2 text-yellow-500" /> Game Results
            </h1>
            
            <div className="overflow-hidden mb-8">
              <table className="min-w-full bg-white">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="py-4 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gameResults?.sort((a, b) => b.score - a.score).map((result, index) => (
                    <tr key={result.playerId} className={index === 0 ? "bg-gradient-to-r from-yellow-50 to-yellow-100" : "hover:bg-gray-50 transition-colors duration-200"}>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {index === 0 ? (
                          <span className="flex items-center text-yellow-600">
                            <FiAward className="mr-2" /> {index + 1}
                          </span>
                        ) : (
                          index + 1
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{result.username}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 text-right font-bold">{result.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={returnToLobby} 
                variant="bubble"
                className="w-full max-w-xs font-bold rounded-xl py-3 shadow-md"
              >
                Return to Lobby
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div className="relative min-h-screen bg-bubble-gradient overflow-hidden flex items-center justify-center">
        <BackgroundBubbles />
        <div className="container mx-auto px-4 py-10 flex justify-center items-center relative z-10">
          <Loading text="Loading game..." />
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen bg-bubble-gradient overflow-hidden flex items-center justify-center">
      <BackgroundBubbles />
      <div className="container mx-auto px-4 py-10 relative z-10">
        <div className="max-w-3xl mx-auto bg-bubble-dark/80 border-2 border-bubble-blue rounded-2xl shadow-bubble p-8">
          {showCorrectAnimation && (
            <CorrectAnswerAnimation
              x={animationPosition.x}
              y={animationPosition.y}
              onComplete={handleAnimationComplete}
            />
          )}
          <div className="max-w-3xl mx-auto shadow-lg overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-500 font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  <FiClock className="mr-2" /> {timeLeft}s
                </div>
                <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  <FiAward className="mr-2" /> {currentMaxScore} pts
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-8">
              <div 
                className="h-2.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${(timeLeft / 15) * 100}%`,
                  background: `linear-gradient(90deg, #3b82f6 ${(timeLeft / 15) * 100}%, #ef4444 ${(timeLeft / 15) * 100}%)`
                }}
              />
            </div>
            
            <h2 className="text-3xl font-extrabold mb-10 text-center bg-gradient-to-r from-bubble-blue to-bubble-pink bg-clip-text text-transparent drop-shadow-lg">
              What is the meaning of &quot;{currentQuestion.word}&quot;?
            </h2>
            
            <div className="grid grid-cols-1 gap-5 mb-6">
              {currentQuestion.options.map(option => {
                const isSelected = selectedOption === option.id;
                const isCorrect = option.isCorrect;
                const showCorrectness = hasAnswered || timeLeft === 0;
                let buttonClass = "w-full text-lg font-semibold text-bubble-dark text-left px-6 py-4 rounded-2xl border-2 border-bubble-blue bg-bubble-light shadow-bubble transition-all duration-200";
                if (showCorrectness) {
                  if (isCorrect) {
                    buttonClass += " bg-green-100 border-green-400 text-green-900 animate-pulse-fast";
                  } else if (isSelected) {
                    buttonClass += " bg-red-100 border-red-400 text-red-900 animate-pulse-fast";
                  } else {
                    buttonClass += " opacity-80";
                  }
                } else {
                  buttonClass += isSelected 
                    ? " bg-bubble-blue/20 border-bubble-blue text-bubble-blue shadow-neon" 
                    : " hover:bg-bubble-blue/80 hover:border-bubble-blue hover:shadow-neon";
                }
                return (
                  <button
                    key={option.id}
                    onClick={(e) => handleSelectOption(option.id, e)}
                    disabled={hasAnswered || timeLeft === 0}
                    className={buttonClass}
                    style={{ cursor: hasAnswered || timeLeft === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="flex items-center">
                      {showCorrectness && (
                        <span className="mr-3">
                          {isCorrect ? (
                            <FiCheck className="text-green-500" />
                          ) : isSelected ? (
                            <FiX className="text-red-500" />
                          ) : null}
                        </span>
                      )}
                      <span>{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 