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
import { Topic } from './Topic.js';
let Vocabulary = class Vocabulary {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Vocabulary.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Vocabulary.prototype, "word", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Vocabulary.prototype, "pronunciation", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Vocabulary.prototype, "meaning", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Vocabulary.prototype, "topic_id", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Vocabulary.prototype, "synonym", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], Vocabulary.prototype, "word_family", void 0);
__decorate([
    Column({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Vocabulary.prototype, "example", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Vocabulary.prototype, "created_at", void 0);
__decorate([
    ManyToOne(() => Topic),
    JoinColumn({ name: 'topic_id' }),
    __metadata("design:type", Topic)
], Vocabulary.prototype, "topic", void 0);
Vocabulary = __decorate([
    Entity('vocabulary')
], Vocabulary);
export { Vocabulary };
