import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { IRoom } from '../types/entities.js';
import { RoomUser } from './RoomUser.js';

@Entity('rooms')
export class Room implements Partial<IRoom> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: true })
  code!: string;

  @Column({ default: 'waiting' })
  status!: 'waiting' | 'playing' | 'finished';

  @CreateDateColumn()
  created_at!: Date;

  @Column({ nullable: true })
  started_at!: Date;

  @Column({ nullable: true })
  ended_at!: Date;

  @OneToMany('RoomUser', (roomUser: RoomUser) => roomUser.room)
  roomUsers!: RoomUser[];
} 