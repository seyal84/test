import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller.js';
import { ListingsService } from './listings.service.js';
import { PrismaService } from '../../common/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
	imports: [AuthModule],
	controllers: [ListingsController],
	providers: [ListingsService, PrismaService],
	exports: [ListingsService],
})
export class ListingsModule {}