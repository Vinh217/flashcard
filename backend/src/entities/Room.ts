import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import type { User } from './User.ts';
import { IRoom } from '../types/entities.ts';

@Entity()
export class Room implements IRoom {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ default: 'waiting' })
  status!: 'waiting' | 'playing' | 'ended';

  @CreateDateColumn()
  created_at!: Date;

  @Column({ nullable: true })
  started_at!: Date;

  @OneToMany('User', (user: User) => user.room)
  players!: User[];
} 