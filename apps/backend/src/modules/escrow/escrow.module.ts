import { Module } from '@nestjs/common';
import { EscrowController } from './escrow.controller.js';
import { EscrowService } from './escrow.service.js';
import { PrismaService } from '../../common/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
	imports: [AuthModule],
	controllers: [EscrowController],
	providers: [EscrowService, PrismaService],
	exports: [EscrowService],
})
export class EscrowModule {}