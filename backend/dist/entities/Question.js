var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { UserAnswer } from './UserAnswer.js';
let Question = class Question {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Question.prototype, "id", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["PART5", "PART6", "PART7"]
    }),
    __metadata("design:type", String)
], Question.prototype, "part", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["grammar", "vocabulary", "preposition", "conjunction"]
    }),
    __metadata("design:type", String)
], Question.prototype, "type", void 0);
__decorate([
    Column("text"),
    __metadata("design:type", String)
], Question.prototype, "content", void 0);
__decorate([
    Column("simple-json"),
    __metadata("design:type", Array)
], Question.prototype, "options", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Question.prototype, "correct_answer", void 0);
__decorate([
    Column("text"),
    __metadata("design:type", String)
], Question.prototype, "explanation", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Question.prototype, "difficulty", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Question.prototype, "created_at", void 0);
__decorate([
    OneToMany(() => UserAnswer, answer => answer.question),
    __metadata("design:type", Array)
], Question.prototype, "answers", void 0);
Question = __decorate([
    Entity("questions")
], Question);
export { Question };
