import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import type { Room } from './Room.ts';
import { IUser } from '../types/entities.ts';

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column({ default: 0 })
  score!: number;

  @Column({ default: false })
  is_host!: boolean;

  @Column()
  socket_id!: string;

  @ManyToOne('Room', (room: Room) => room.players)
  @JoinColumn({ name: 'room_id' })
  room!: Room;
} 