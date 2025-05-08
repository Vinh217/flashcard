import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type { User } from "./User.js";

@Entity("user_progress")
export class UserProgress {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        type: "enum",
        enum: ["PART5", "PART6", "PART7"]
    })
    part!: "PART5" | "PART6" | "PART7";

    @Column({
        type: "enum",
        enum: ["grammar", "vocabulary", "preposition", "conjunction"]
    })
    type!: "grammar" | "vocabulary" | "preposition" | "conjunction";

    @Column()
    total_questions!: number;

    @Column()
    correct_answers!: number;

    @Column("float")
    average_time!: number;

    @Column("simple-json", { nullable: true })
    weak_points!: string[];

    @Column()
    user_id!: string;

    @ManyToOne('User', (user: User) => user.progress)
    user!: User;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
} 