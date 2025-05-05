import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from 'typeorm';
import type { User } from './User.ts';
import type { Room } from './Room.ts';

@Entity('room_users')
export class RoomUser {
  @PrimaryColumn()
  room_id!: string;

  @PrimaryColumn()
  user_id!: string;

  @Column({ default: 0 })
  score!: number;

  @CreateDateColumn()
  joined_at!: Date;

  @ManyToOne('Room', (room: Room) => room.roomUsers)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @ManyToOne('User', (user: User) => user.roomUsers)
  @JoinColumn({ name: 'user_id' })
  user!: User;
} 