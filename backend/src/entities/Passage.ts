import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { QuestionPart } from '../types/question.js';
import { Question } from './Question.js';

@Entity("passages")
export class Passage {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("text")
    passage!: string;

    @Column("text", { nullable: true })
    text_with_blanks?: string;

    @Column("simple-json", { nullable: true })
    blank_positions?: number[];

    @Column({
        type: "enum",
        enum: ["PART6", "PART7"]
    })
    part!: QuestionPart;

    @CreateDateColumn()
    created_at!: Date;

    @OneToMany(() => Question, (question) => question.passage)
    questions!: Question[];
} 