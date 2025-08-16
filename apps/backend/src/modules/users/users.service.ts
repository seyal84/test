import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { UserRole } from '../../common/constants.js';

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	findByEmail(email: string) {
		return this.prisma.user.findUnique({ where: { email } });
	}

	async upsertUser(email: string, fullName: string, role: UserRole) {
		return this.prisma.user.upsert({
			where: { email },
			update: { fullName, role },
			create: { email, fullName, role },
		});
	}

	async anonymizeUser(userId: string) {
		return this.prisma.$transaction([
			this.prisma.offer.updateMany({ where: { buyerId: userId }, data: { buyerId: 'deleted' } }),
			this.prisma.listing.updateMany({ where: { sellerId: userId }, data: { sellerId: 'deleted' } }),
			this.prisma.user.update({ where: { id: userId }, data: { email: `deleted_${userId}@example.com`, fullName: 'Deleted User', deletedAt: new Date() } }),
		]);
	}
}