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
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../../common/rbac.decorator.js';
import { UserRole } from '../../common/constants.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
let OffersController = class OffersController {
    offersService;
    constructor(offersService) {
        this.offersService = offersService;
    }
    submit(req, dto) {
        const buyerId = req.user?.sub || req.user?.username || 'buyer-placeholder';
        return this.offersService.submit(buyerId, dto);
    }
    respond(id, action, amount) {
        return this.offersService.respond(id, UserRole.SELLER, action, amount ? Number(amount) : undefined);
    }
    history(id) {
        return this.offersService.history(id);
    }
};
__decorate([
    Roles(UserRole.BUYER),
    Post(),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateOfferDto]),
    __metadata("design:returntype", void 0)
], OffersController.prototype, "submit", null);
__decorate([
    Roles(UserRole.SELLER),
    Post(':id/respond'),
    __param(0, Param('id')),
    __param(1, Query('action')),
    __param(2, Query('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], OffersController.prototype, "respond", null);
__decorate([
    Roles(UserRole.BUYER, UserRole.SELLER),
    Get(':id/history'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OffersController.prototype, "history", null);
OffersController = __decorate([
    Controller('offers'),
    UseGuards(JwtAuthGuard, RolesGuard),
    __metadata("design:paramtypes", [OffersService])
], OffersController);
export { OffersController };
//# sourceMappingURL=offers.controller.js.map