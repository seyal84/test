import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service.js';
import { AIService } from '../../common/ai.service.js';
import { NotificationService } from '../../common/notification.service.js';
import { WebSocketGateway } from '../../common/websocket.gateway.js';
import { S3Service } from './s3.service.js';
import { DocumentType, DocumentProcessingStatus } from '@prisma/client';
export interface DocumentUploadResult {
    id: string;
    name: string;
    url: string;
    type: DocumentType;
    processingStatus: DocumentProcessingStatus;
}
export interface DocumentProcessingOptions {
    enableAI?: boolean;
    extractText?: boolean;
    generateThumbnail?: boolean;
    notifyUsers?: boolean;
}
export declare class DocumentService {
    private prisma;
    private aiService;
    private notificationService;
    private websocketGateway;
    private s3Service;
    private configService;
    private readonly logger;
    private readonly allowedTypes;
    private readonly maxFileSize;
    constructor(prisma: PrismaService, aiService: AIService, notificationService: NotificationService, websocketGateway: WebSocketGateway, s3Service: S3Service, configService: ConfigService);
    uploadDocument(file: Express.Multer.File, uploadedById: string, options?: {
        listingId?: string;
        offerId?: string;
        escrowId?: string;
        milestoneId?: string;
        type?: DocumentType;
    }, processingOptions?: DocumentProcessingOptions): Promise<DocumentUploadResult>;
    getDocument(documentId: string, userId: string): Promise<any>;
    getDocuments(filters: {
        listingId?: string;
        offerId?: string;
        escrowId?: string;
        milestoneId?: string;
        type?: DocumentType;
        userId?: string;
    }): Promise<any>;
    deleteDocument(documentId: string, userId: string): Promise<void>;
    private processDocumentAsync;
    private validateFile;
    private determineDocumentType;
    private sendUploadNotifications;
    private getUsersToNotify;
    generateThumbnail(documentId: string): Promise<string>;
}
