import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { EscrowStatus } from '@prisma/client';

@Injectable()
export class EscrowService {
	constructor(private readonly prisma: PrismaService) {}

	getByOffer(offerId: string) {
		return this.prisma.escrow.findUnique({ where: { offerId }, include: { documents: true } });
	}

	async addDocument(escrowId: string, name: string, s3Key: string) {
		const escrow = await this.prisma.escrow.findUnique({ where: { id: escrowId } });
		if (!escrow) throw new NotFoundException('Escrow not found');
		return this.prisma.document.create({ data: { escrowId, name, s3Key } });
	}

	setStatus(escrowId: string, status: EscrowStatus) {
		return this.prisma.escrow.update({ where: { id: escrowId }, data: { status } });
	}
}