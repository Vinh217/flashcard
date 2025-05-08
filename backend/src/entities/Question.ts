import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import type { UserAnswer } from './UserAnswer.js';
import { Passage } from './Passage.js';
import { QuestionSet } from './QuestionSet.js';
import { QuestionPart, QuestionType, QuestionCategory } from '../types/question.js';

@Entity("questions")
export class Question {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        type: "enum",
        enum: ["PART5", "PART6", "PART7"]
    })
    part!: QuestionPart;

    @Column({
        type: "enum",
        enum: ["grammar", "vocabulary", "preposition", "conjunction", "main_idea", "detail", "inference", "purpose", "reference"]
    })
    type!: QuestionType;

    @Column("text")
    content!: string;

    // For PART 6: The text with blanks
    @Column("text", { nullable: true })
    text_with_blanks?: string;

    // For PART 6: Positions of blanks in the text
    @Column("simple-json", { nullable: true })
    blank_positions?: number[];

    @Column("simple-json")
    options!: string[];

    @Column()
    correct_answer!: string;

    @Column("text")
    explanation!: string;

    @Column()
    difficulty!: number;

    // For PART 7: Reference to the paragraph number
    @Column({ nullable: true })
    paragraph_number?: number;

    // For PART 7: Question category (main idea, detail, inference, etc.)
    @Column({
        type: "enum",
        enum: ["main_idea", "detail", "inference", "purpose", "reference"],
        nullable: true
    })
    question_category?: QuestionCategory;

    @ManyToOne(() => Passage, (passage) => passage.questions, { nullable: true })
    @JoinColumn({ name: "passage_id" })
    passage?: Passage;

    @ManyToOne(() => QuestionSet, (set) => set.questions, { nullable: true })
    @JoinColumn({ name: "question_set_id" })
    question_set?: QuestionSet;

    @CreateDateColumn()
    created_at!: Date;

    @OneToMany('UserAnswer', (answer: UserAnswer) => answer.question)
    answers!: UserAnswer[];
} 