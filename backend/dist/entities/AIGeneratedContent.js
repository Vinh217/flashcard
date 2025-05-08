var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
let AIGeneratedContent = class AIGeneratedContent {
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], AIGeneratedContent.prototype, "id", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["question", "explanation", "suggestion"]
    }),
    __metadata("design:type", String)
], AIGeneratedContent.prototype, "type", void 0);
__decorate([
    Column("text"),
    __metadata("design:type", String)
], AIGeneratedContent.prototype, "content", void 0);
__decorate([
    Column("simple-json"),
    __metadata("design:type", Object)
], AIGeneratedContent.prototype, "metadata", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], AIGeneratedContent.prototype, "created_by", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], AIGeneratedContent.prototype, "created_at", void 0);
AIGeneratedContent = __decorate([
    Entity("ai_generated_content")
], AIGeneratedContent);
export { AIGeneratedContent };
