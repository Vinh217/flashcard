import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Question } from './Question.js';

@Entity("question_sets")
export class QuestionSet {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @CreateDateColumn()
    created_at!: Date;

    @OneToMany(() => Question, (question) => question.question_set)
    questions!: Question[];
} 