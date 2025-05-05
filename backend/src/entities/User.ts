import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { RoomUser } from './RoomUser.js';
import { IUser } from '../types/entities';

@Entity('users')
export class User implements Partial<IUser> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column({ default: false })
  is_host!: boolean;

  @Column()
  socket_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => RoomUser, roomUser => roomUser.user)
  roomUsers!: RoomUser[];
} 