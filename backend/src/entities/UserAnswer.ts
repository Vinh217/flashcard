import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import type { User } from "./User.js";
import type { Question } from "./Question.js";

@Entity("user_answers")
export class UserAnswer {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    user_id!: string;

    @Column()
    question_id!: string;

    @Column()
    user_answer!: string;

    @Column()
    is_correct!: boolean;

    @Column("float")
    time_taken!: number;

    @ManyToOne('User', (user: User) => user.answers)
    user!: User;

    @ManyToOne('Question', (question: Question) => question.answers)
    question!: Question;

    @CreateDateColumn()
    created_at!: Date;
} 