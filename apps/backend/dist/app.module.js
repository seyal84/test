var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
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
                    ttl: parseInt(process.env.RATE_LIMIT_TTL || '900') * 1000,
                    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100'),
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
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map