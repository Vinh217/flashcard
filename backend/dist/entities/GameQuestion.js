var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from './Room.js';
import { Vocabulary } from './Vocabulary.js';
let GameQuestion = class GameQuestion {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], GameQuestion.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], GameQuestion.prototype, "room_id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], GameQuestion.prototype, "vocabulary_id", void 0);
__decorate([
    CreateDateColumn({ name: 'asked_at' }),
    __metadata("design:type", Date)
], GameQuestion.prototype, "asked_at", void 0);
__decorate([
    ManyToOne(() => Room),
    JoinColumn({ name: 'room_id' }),
    __metadata("design:type", Room)
], GameQuestion.prototype, "room", void 0);
__decorate([
    ManyToOne(() => Vocabulary),
    JoinColumn({ name: 'vocabulary_id' }),
    __metadata("design:type", Vocabulary)
], GameQuestion.prototype, "vocabulary", void 0);
GameQuestion = __decorate([
    Entity('game_questions')
], GameQuestion);
export { GameQuestion };
