import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { EscrowStatus, OfferStatus, UserRole } from '../../common/constants.js';

@Injectable()
export class OffersService {
	constructor(private readonly prisma: PrismaService) {}

	submit(buyerId: string, dto: CreateOfferDto) {
		return this.prisma.offer.create({ data: { listingId: dto.listingId, buyerId, amount: dto.amount } });
	}

	async respond(offerId: string, actorRole: UserRole, action: 'accept' | 'decline' | 'counter', amount?: number) {
		const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
		if (!offer) throw new NotFoundException('Offer not found');
		if (action === 'counter' && (!amount || amount <= 0)) throw new BadRequestException('Counter amount required');

		const updates: any = {};
		if (action === 'accept') updates.status = OfferStatus.ACCEPTED;
		if (action === 'decline') updates.status = OfferStatus.DECLINED;
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

	history(offerId: string) {
		return this.prisma.negotiation.findMany({ where: { offerId }, orderBy: { createdAt: 'asc' } });
	}
}