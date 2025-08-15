import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../../common/rbac.decorator.js';
import { UserRole } from '@prisma/client';
import { CreateListingDto } from './dto/create-listing.dto.js';

@Controller('listings')
export class ListingsController {
	constructor(private readonly listingsService: ListingsService) {}

	@Get()
	list(@Query('q') q?: string, @Query('min') min?: string, @Query('max') max?: string) {
		return this.listingsService.list({ q, min: min ? Number(min) : undefined, max: max ? Number(max) : undefined });
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.SELLER)
	@Post()
	create(@Req() req: any, @Body() dto: CreateListingDto) {
		const sellerId = req.user?.sub || req.user?.username || 'seller-placeholder';
		return this.listingsService.create(sellerId, dto);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.SELLER)
	@Put(':id')
	update(@Param('id') id: string, @Body() dto: Partial<CreateListingDto>) {
		return this.listingsService.update(id, dto);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.SELLER)
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.listingsService.remove(id);
	}
}