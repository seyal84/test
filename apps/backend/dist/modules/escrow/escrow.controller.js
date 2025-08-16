var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { EscrowService } from './escrow.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../../common/rbac.decorator.js';
import { UserRole } from '@prisma/client';
let EscrowController = class EscrowController {
    escrowService;
    constructor(escrowService) {
        this.escrowService = escrowService;
    }
    getByOffer(offerId) {
        return this.escrowService.getByOffer(offerId);
    }
    addDoc(escrowId, body) {
        return this.escrowService.addDocument(escrowId, body.name, body.s3Key);
    }
    setStatus(id, body) {
        return this.escrowService.setStatus(id, body.status);
    }
};
__decorate([
    Roles(UserRole.BUYER, UserRole.SELLER),
    Get('offer/:offerId'),
    __param(0, Param('offerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "getByOffer", null);
__decorate([
    Roles(UserRole.BUYER, UserRole.SELLER),
    Post(':id/documents'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "addDoc", null);
__decorate([
    Roles(UserRole.SELLER),
    Put(':id/status'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "setStatus", null);
EscrowController = __decorate([
    Controller('escrow'),
    UseGuards(JwtAuthGuard, RolesGuard),
    __metadata("design:paramtypes", [EscrowService])
], EscrowController);
export { EscrowController };
//# sourceMappingURL=escrow.controller.js.map