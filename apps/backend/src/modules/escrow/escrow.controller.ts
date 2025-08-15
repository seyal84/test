import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { EscrowService } from './escrow.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../../common/rbac.decorator.js';
import { UserRole, EscrowStatus } from '../../common/constants.js';

@Controller('escrow')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EscrowController {
	constructor(private readonly escrowService: EscrowService) {}

	@Roles(UserRole.BUYER, UserRole.SELLER)
	@Get('offer/:offerId')
	getByOffer(@Param('offerId') offerId: string) {
		return this.escrowService.getByOffer(offerId);
	}

	@Roles(UserRole.BUYER, UserRole.SELLER)
	@Post(':id/documents')
	addDoc(@Param('id') escrowId: string, @Body() body: { name: string; s3Key: string }) {
		return this.escrowService.addDocument(escrowId, body.name, body.s3Key);
	}

	@Roles(UserRole.SELLER)
	@Put(':id/status')
	setStatus(@Param('id') id: string, @Body() body: { status: EscrowStatus }) {
		return this.escrowService.setStatus(id, body.status);
	}
}