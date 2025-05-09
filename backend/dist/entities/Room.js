var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
let Room = class Room {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Room.prototype, "id", void 0);
__decorate([
    Column({ unique: true }),
    __metadata("design:type", String)
], Room.prototype, "code", void 0);
__decorate([
    Column({ default: 'waiting' }),
    __metadata("design:type", String)
], Room.prototype, "status", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Room.prototype, "created_at", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", Date)
], Room.prototype, "started_at", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", Date)
], Room.prototype, "ended_at", void 0);
__decorate([
    OneToMany('RoomUser', (roomUser) => roomUser.room),
    __metadata("design:type", Array)
], Room.prototype, "roomUsers", void 0);
Room = __decorate([
    Entity('rooms')
], Room);
export { Room };
