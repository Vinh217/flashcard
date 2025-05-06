'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/app/context/SocketContext';
import { useGameStore } from '@/app/store/useGameStore';
import { Button } from '@/app/components/ui/button';
import { FiClock, FiCheck, FiX, FiAward } from 'react-icons/fi';
import Loading from '@/app/components/Loading';
import CorrectAnswerAnimation from '@/app/components/CorrectAnswerAnimation';

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
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center">
            <FiAward className="mr-2 text-yellow-500" /> Game Results
          </h1>
          
          <div className="overflow-hidden mb-8">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gameResults?.sort((a, b) => b.score - a.score).map((result, index) => (
                  <tr key={result.playerId} className={index === 0 ? "bg-yellow-50" : ""}>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      {index === 0 ? (
                        <span className="flex items-center text-yellow-500">
                          <FiAward className="mr-1" /> {index + 1}
                        </span>
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">{result.username}</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right font-bold">{result.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={returnToLobby} variant="outline">
              Return to Lobby
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center items-center">
        <Loading text="Loading game..." />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10">
      {showCorrectAnimation && (
        <CorrectAnswerAnimation
          x={animationPosition.x}
          y={animationPosition.y}
          onComplete={handleAnimationComplete}
        />
      )}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              <FiClock className="mr-1" /> {timeLeft}s
            </div>
            <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <FiAward className="mr-1" /> {currentMaxScore} pts
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ 
              width: `${(timeLeft / 15) * 100}%`,
              background: `linear-gradient(90deg, #3b82f6 ${(timeLeft / 15) * 100}%, #ef4444 ${(timeLeft / 15) * 100}%)`
            }}
          />
        </div>
        
        <h2 className="text-2xl font-bold mb-8 text-center border-b pb-4">
          What is the meaning of &quot;{currentQuestion.word}&quot;?
        </h2>
        
        <div className="grid grid-cols-1 gap-3 mb-6">
          {currentQuestion.options.map(option => {
            const isSelected = selectedOption === option.id;
            const isCorrect = option.isCorrect;
            const showCorrectness = hasAnswered || timeLeft === 0;
            
            let buttonClass = "text-left p-4 rounded-lg border";
            
            if (showCorrectness) {
              if (isCorrect) {
                buttonClass += " bg-green-50 border-green-200 text-green-800";
              } else if (isSelected) {
                buttonClass += " bg-red-50 border-red-200 text-red-800";
              } else {
                buttonClass += " bg-gray-50 border-gray-200 text-gray-800";
              }
            } else {
              buttonClass += isSelected 
                ? " bg-blue-50 border-blue-200 text-blue-800" 
                : " hover:bg-gray-50 border-gray-200";
            }
            
            return (
              <button
                key={option.id}
                className={buttonClass}
                onClick={(e) => handleSelectOption(option.id, e)}
                disabled={hasAnswered || timeLeft === 0}
              >
                <div className="flex justify-between items-center">
                  <span>{option.text}</span>
                  {showCorrectness && isCorrect && (
                    <FiCheck className="text-green-500" />
                  )}
                  {showCorrectness && isSelected && !isCorrect && (
                    <FiX className="text-red-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 