export interface IRoom {
  id: string;
  code: string;
  status: 'waiting' | 'playing' | 'ended';
  created_at: Date;
  started_at?: Date;
  players: IUser[];
}

export interface IUser {
  id: string;
  username: string;
  score: number;
  is_host: boolean;
  socket_id: string;
  room: IRoom;
} 