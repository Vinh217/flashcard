export interface IRoom {
  id: string;
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  created_at: Date;
  started_at?: Date;
  ended_at?: Date;
  roomUsers?: IRoomUser[];
}

export interface IUser {
  id: string;
  username: string;
  is_host: boolean;
  socket_id: string;
  created_at: Date;
  roomUsers?: IRoomUser[];
}

export interface IRoomUser {
  room_id: string;
  user_id: string;
  score: number;
  joined_at: Date;
  room?: IRoom;
  user?: IUser;
}

export interface IPlayer {
  id: string;
  username: string;
  isHost: boolean;
  score: number;
  socket_id: string;
}

export interface IVocabulary {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  topic_id: string;
  synonym?: string;
  word_family?: string;
  example?: string;
  created_at: Date;
}

export interface IGameQuestion {
  id: string;
  room_id: string;
  vocabulary_id: string;
  asked_at: Date;
  vocabulary?: IVocabulary;
}

export interface IQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuizQuestion {
  id: string;
  word: string;
  options: IQuestionOption[];
}

export interface IUserAnswer {
  playerId: string;
  questionId: string;
  optionId: string;
  isCorrect: boolean;
  answerTime: number;
}

export interface IGameResult {
  playerId: string;
  username: string;
  score: number;
} 