import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { PrismaService } from '../../common/prisma.service.js';

@Module({
	providers: [UsersService, PrismaService],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}