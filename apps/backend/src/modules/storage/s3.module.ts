import { Module } from '@nestjs/common';
import { S3Controller } from './s3.controller.js';
import { S3Service } from './s3.service.js';
import { DocumentController } from './document.controller.js';
import { DocumentService } from './document.service.js';
import { AIService } from '../../common/ai.service.js';
import { NotificationService } from '../../common/notification.service.js';
import { WebSocketGateway } from '../../common/websocket.gateway.js';
import { PrismaService } from '../../common/prisma.service.js';

@Module({
  controllers: [S3Controller, DocumentController],
  providers: [
    S3Service, 
    DocumentService, 
    AIService, 
    NotificationService, 
    WebSocketGateway,
    PrismaService
  ],
  exports: [S3Service, DocumentService],
})
export class S3Module {}