import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Vocabulary } from './Vocabulary.js';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Vocabulary, vocabulary => vocabulary.topic)
  vocabularies!: Vocabulary[];
} 