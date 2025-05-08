import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import type { Vocabulary } from './Vocabulary.js';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany('Vocabulary', (vocabulary: Vocabulary) => vocabulary.topic)
  vocabularies!: Vocabulary[];
} 