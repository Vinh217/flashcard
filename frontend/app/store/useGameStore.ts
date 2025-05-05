'use client';

import { create } from 'zustand';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  word: string;
  options: QuestionOption[];
}

interface Player {
  id: string;
  username: string;
  isHost: boolean;
  score: number;
  socket_id: string;
}

interface GameResult {
  playerId: string;
  username: string;
  score: number;
}

interface UserAnswer {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
}

interface GameState {
  // Room info
  roomCode: string;
  roomId: string;
  players: Player[];
  isHost: boolean;
  status?: 'waiting' | 'playing' | 'finished';

  // Game state
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, UserAnswer>;
  gameResults: GameResult[];

  // Game actions
  setRoomCode: (roomCode: string) => void;
  setPlayers: (players: Player[]) => void;
  updatePlayers: (players: Player[]) => void;
  setRoomInfo: (data: { roomId: string; roomCode: string; players: Player[]; isHost?: boolean; status?: 'waiting' | 'playing' | 'finished' }) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setUserAnswer: (questionId: string, optionId: string, isCorrect?: boolean) => void;
  setGameResults: (results: GameResult[]) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  roomCode: '',
  roomId: '',
  players: [],
  isHost: false,
  status: 'waiting',
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  gameResults: [],

  // Actions
  setRoomCode: (roomCode) => set({ roomCode }),
  
  setPlayers: (players) => set({ players }),
  
  updatePlayers: (players) => set({ players }),
  
  setRoomInfo: (data) => set({
    roomId: data.roomId,
    roomCode: data.roomCode,
    players: data.players,
    isHost: data.isHost !== undefined ? data.isHost : false,
    status: data.status
  }),
  
  setQuestions: (questions) => set({ questions }),
  
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  
  setUserAnswer: (questionId, optionId, isCorrect = false) => 
    set((state) => ({
      userAnswers: {
        ...state.userAnswers,
        [questionId]: { questionId, optionId, isCorrect }
      }
    })),
  
  setGameResults: (results) => set({ gameResults: results }),
  
  resetGame: () => set({
    currentQuestionIndex: 0,
    userAnswers: {},
    gameResults: []
  })
})); 