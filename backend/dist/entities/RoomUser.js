var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { Room } from './Room.js';
import { User } from './User.js';
let RoomUser = class RoomUser {
};
__decorate([
    PrimaryColumn(),
    __metadata("design:type", String)
], RoomUser.prototype, "room_id", void 0);
__decorate([
    PrimaryColumn(),
    __metadata("design:type", String)
], RoomUser.prototype, "user_id", void 0);
__decorate([
    Column({ default: 0 }),
    __metadata("design:type", Number)
], RoomUser.prototype, "score", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], RoomUser.prototype, "joined_at", void 0);
__decorate([
    ManyToOne('Room', (room) => room.roomUsers),
    JoinColumn({ name: 'room_id' }),
    __metadata("design:type", Room)
], RoomUser.prototype, "room", void 0);
__decorate([
    ManyToOne('User', (user) => user.roomUsers),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", User)
], RoomUser.prototype, "user", void 0);
RoomUser = __decorate([
    Entity('room_users')
], RoomUser);
export { RoomUser };
