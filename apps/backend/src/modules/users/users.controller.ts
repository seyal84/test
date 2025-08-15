import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../../common/rbac.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me/:email')
	@Roles(UserRole.ADMIN, UserRole.BUYER, UserRole.SELLER, UserRole.SERVICE_PROVIDER)
	getMe(@Param('email') email: string) {
		return this.usersService.findByEmail(email);
	}

	@Delete(':id')
	@Roles(UserRole.ADMIN)
	anonymize(@Param('id') id: string) {
		return this.usersService.anonymizeUser(id);
	}
}