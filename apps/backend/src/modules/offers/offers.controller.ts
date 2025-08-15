import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../../common/rbac.decorator.js';
import { UserRole } from '@prisma/client';
import { CreateOfferDto } from './dto/create-offer.dto.js';

@Controller('offers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OffersController {
	constructor(private readonly offersService: OffersService) {}

	@Roles(UserRole.BUYER)
	@Post()
	submit(@Req() req: any, @Body() dto: CreateOfferDto) {
		const buyerId = req.user?.sub || req.user?.username || 'buyer-placeholder';
		return this.offersService.submit(buyerId, dto);
	}

	@Roles(UserRole.SELLER)
	@Post(':id/respond')
	respond(@Param('id') id: string, @Query('action') action: 'accept' | 'decline' | 'counter', @Query('amount') amount?: string) {
		return this.offersService.respond(id, UserRole.SELLER, action, amount ? Number(amount) : undefined);
	}

	@Roles(UserRole.BUYER, UserRole.SELLER)
	@Get(':id/history')
	history(@Param('id') id: string) {
		return this.offersService.history(id);
	}
}