var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { EscrowStatus, OfferStatus } from '../../common/constants.js';
let OffersService = class OffersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    submit(buyerId, dto) {
        return this.prisma.offer.create({ data: { listingId: dto.listingId, buyerId, amount: dto.amount } });
    }
    async respond(offerId, actorRole, action, amount) {
        const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer)
            throw new NotFoundException('Offer not found');
        if (action === 'counter' && (!amount || amount <= 0))
            throw new BadRequestException('Counter amount required');
        const updates = {};
        if (action === 'accept')
            updates.status = OfferStatus.ACCEPTED;
        if (action === 'decline')
            updates.status = OfferStatus.DECLINED;
        if (action === 'counter') {
            updates.status = OfferStatus.COUNTERED;
            updates.amount = amount;
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.offer.update({ where: { id: offerId }, data: updates });
            await tx.negotiation.create({ data: { offerId, fromRole: actorRole, message: action.toUpperCase() + (amount ? `:${amount}` : '') } });
            if (action === 'accept') {
                await tx.escrow.create({ data: { offerId: updated.id, status: EscrowStatus.OPEN } });
            }
            return updated;
        });
        return result;
    }
    history(offerId) {
        return this.prisma.negotiation.findMany({ where: { offerId }, orderBy: { createdAt: 'asc' } });
    }
};
OffersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], OffersService);
export { OffersService };
//# sourceMappingURL=offers.service.js.map