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
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../../common/rbac.decorator.js';
import { UserRole } from '@prisma/client';
import { CreateListingDto } from './dto/create-listing.dto.js';
let ListingsController = class ListingsController {
    listingsService;
    constructor(listingsService) {
        this.listingsService = listingsService;
    }
    list(q, min, max) {
        return this.listingsService.list({ q, min: min ? Number(min) : undefined, max: max ? Number(max) : undefined });
    }
    create(req, dto) {
        const sellerId = req.user?.sub || req.user?.username || 'seller-placeholder';
        return this.listingsService.create(sellerId, dto);
    }
    update(id, dto) {
        return this.listingsService.update(id, dto);
    }
    remove(id) {
        return this.listingsService.remove(id);
    }
};
__decorate([
    Get(),
    __param(0, Query('q')),
    __param(1, Query('min')),
    __param(2, Query('max')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "list", null);
__decorate([
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SELLER),
    Post(),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateListingDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "create", null);
__decorate([
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SELLER),
    Put(':id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "update", null);
__decorate([
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SELLER),
    Delete(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "remove", null);
ListingsController = __decorate([
    Controller('listings'),
    __metadata("design:paramtypes", [ListingsService])
], ListingsController);
export { ListingsController };
//# sourceMappingURL=listings.controller.js.map