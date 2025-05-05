import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IGameQuestion } from '../types/entities';
import { Room } from './Room.js';
import { Vocabulary } from './Vocabulary.js';


@Entity('game_questions')
export class GameQuestion implements Partial<IGameQuestion> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  room_id!: string;

  @Column()
  vocabulary_id!: string;

  @CreateDateColumn({ name: 'asked_at' })
  asked_at!: Date;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @ManyToOne(() => Vocabulary)
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary!: Vocabulary;
} 