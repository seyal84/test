var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async upsertUser(email, fullName, role) {
        return this.prisma.user.upsert({
            where: { email },
            update: { fullName, role },
            create: { email, fullName, role },
        });
    }
    async anonymizeUser(userId) {
        return this.prisma.$transaction([
            this.prisma.offer.updateMany({ where: { buyerId: userId }, data: { buyerId: 'deleted' } }),
            this.prisma.listing.updateMany({ where: { sellerId: userId }, data: { sellerId: 'deleted' } }),
            this.prisma.user.update({ where: { id: userId }, data: { email: `deleted_${userId}@example.com`, fullName: 'Deleted User', deletedAt: new Date() } }),
        ]);
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map