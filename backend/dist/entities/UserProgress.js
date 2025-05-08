var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.js";
let UserProgress = class UserProgress {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], UserProgress.prototype, "id", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["PART5", "PART6", "PART7"]
    }),
    __metadata("design:type", String)
], UserProgress.prototype, "part", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["grammar", "vocabulary", "preposition", "conjunction"]
    }),
    __metadata("design:type", String)
], UserProgress.prototype, "type", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], UserProgress.prototype, "total_questions", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], UserProgress.prototype, "correct_answers", void 0);
__decorate([
    Column("float"),
    __metadata("design:type", Number)
], UserProgress.prototype, "average_time", void 0);
__decorate([
    Column("simple-json", { nullable: true }),
    __metadata("design:type", Array)
], UserProgress.prototype, "weak_points", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], UserProgress.prototype, "user_id", void 0);
__decorate([
    ManyToOne(() => User, user => user.progress),
    __metadata("design:type", User)
], UserProgress.prototype, "user", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], UserProgress.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], UserProgress.prototype, "updated_at", void 0);
UserProgress = __decorate([
    Entity("user_progress")
], UserProgress);
export { UserProgress };
