import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IVocabulary } from '../types/entities';
import { Topic } from './Topic.js';

@Entity('vocabulary')
export class Vocabulary implements Partial<IVocabulary> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  word!: string;

  @Column({ nullable: true })
  pronunciation?: string;

  @Column('text')
  meaning!: string;

  @Column()
  topic_id!: string;

  @Column({ nullable: true })
  synonym?: string;

  @Column({ nullable: true })
  word_family?: string;

  @Column({ nullable: true, type: 'text' })
  example?: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic!: Topic;
} 