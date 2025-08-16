import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './common/prisma.service.js';
import { AIService } from './common/ai.service.js';
import { NotificationService } from './common/notification.service.js';
import { WebSocketGateway } from './common/websocket.gateway.js';
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
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        level: process.env.LOG_LEVEL || 'info',
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '900') * 1000, // 15 minutes default
      limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100'), // 100 requests default
    }]),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ListingsModule,
    OffersModule,
    EscrowModule,
    ServicesModule,
    IntegrationsModule,
    S3Module,
  ],
  providers: [
    PrismaService,
    AIService,
    NotificationService,
    WebSocketGateway,
  ],
  exports: [
    PrismaService,
    AIService,
    NotificationService,
    WebSocketGateway,
  ],
})
export class AppModule {}