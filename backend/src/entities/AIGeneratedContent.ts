import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { QuestionPart, QuestionType, QuestionCategory } from '../types/question.js';

@Entity("ai_generated_content")
export class AIGeneratedContent {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        type: "enum",
        enum: ["question", "explanation", "suggestion"]
    })
    type!: "question" | "explanation" | "suggestion";

    @Column("text")
    content!: string;

    @Column("simple-json")
    metadata!: {
        // Common fields
        part?: QuestionPart;
        type?: QuestionType;
        difficulty?: number;
        context?: string;

        // PART 6 specific fields
        blank_positions?: number[];
        text_with_blanks?: string;

        // PART 7 specific fields
        paragraph_number?: number;
        question_category?: QuestionCategory;
    };

    @Column()
    created_by!: string;

    @CreateDateColumn()
    created_at!: Date;
} 