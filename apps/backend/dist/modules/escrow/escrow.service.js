var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
let EscrowService = class EscrowService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getByOffer(offerId) {
        return this.prisma.escrow.findUnique({ where: { offerId }, include: { documents: true } });
    }
    async addDocument(escrowId, name, s3Key) {
        const escrow = await this.prisma.escrow.findUnique({ where: { id: escrowId } });
        if (!escrow)
            throw new NotFoundException('Escrow not found');
        return this.prisma.document.create({ data: { escrowId, name, s3Key } });
    }
    setStatus(escrowId, status) {
        return this.prisma.escrow.update({ where: { id: escrowId }, data: { status } });
    }
};
EscrowService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], EscrowService);
export { EscrowService };
//# sourceMappingURL=escrow.service.js.map