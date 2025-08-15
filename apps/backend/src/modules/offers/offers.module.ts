import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller.js';
import { OffersService } from './offers.service.js';
import { PrismaService } from '../../common/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
	imports: [AuthModule],
	controllers: [OffersController],
	providers: [OffersService, PrismaService],
	exports: [OffersService],
})
export class OffersModule {}