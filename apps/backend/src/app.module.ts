import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaService } from './common/prisma.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ListingsModule } from './modules/listings/listings.module.js';
import { OffersModule } from './modules/offers/offers.module.js';
import { EscrowModule } from './modules/escrow/escrow.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { IntegrationsModule } from './modules/integrations/integrations.module.js';
import { S3Module } from './modules/storage/s3.module.js';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		LoggerModule.forRoot({
			pinoHttp: {
				transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
			},
		}),
		AuthModule,
		UsersModule,
		ListingsModule,
		OffersModule,
		EscrowModule,
		ServicesModule,
		IntegrationsModule,
		S3Module,
	],
	providers: [PrismaService],
})
export class AppModule {}