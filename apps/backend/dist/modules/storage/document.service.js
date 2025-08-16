var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DocumentService_1;
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service.js';
import { AIService } from '../../common/ai.service.js';
import { NotificationService } from '../../common/notification.service.js';
import { WebSocketGateway } from '../../common/websocket.gateway.js';
import { S3Service } from './s3.service.js';
import { DocumentType, DocumentProcessingStatus } from '@prisma/client';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
let DocumentService = DocumentService_1 = class DocumentService {
    prisma;
    aiService;
    notificationService;
    websocketGateway;
    s3Service;
    configService;
    logger = new Logger(DocumentService_1.name);
    allowedTypes;
    maxFileSize;
    constructor(prisma, aiService, notificationService, websocketGateway, s3Service, configService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.notificationService = notificationService;
        this.websocketGateway = websocketGateway;
        this.s3Service = s3Service;
        this.configService = configService;
        this.allowedTypes = this.configService.get('ALLOWED_FILE_TYPES', 'pdf,doc,docx,jpg,jpeg,png,bmp,tiff,xlsx,csv').split(',');
        this.maxFileSize = parseInt(this.configService.get('MAX_DOCUMENT_SIZE', '50000000'));
    }
    async uploadDocument(file, uploadedById, options = {}, processingOptions = {}) {
        try {
            this.validateFile(file);
            const fileExtension = path.extname(file.originalname);
            const fileName = `${uuidv4()}${fileExtension}`;
            const s3Key = `documents/${fileName}`;
            const uploadResult = await this.s3Service.uploadFile(file.buffer, s3Key, file.mimetype);
            const documentType = options.type || this.determineDocumentType(file.originalname, file.mimetype);
            const document = await this.prisma.document.create({
                data: {
                    name: fileName,
                    originalName: file.originalname,
                    s3Key: s3Key,
                    s3Bucket: uploadResult.bucket,
                    mimeType: file.mimetype,
                    size: file.size,
                    type: documentType,
                    uploadedById: uploadedById,
                    listingId: options.listingId,
                    offerId: options.offerId,
                    escrowId: options.escrowId,
                    milestoneId: options.milestoneId,
                    processingStatus: DocumentProcessingStatus.UPLOADED,
                },
            });
            if (processingOptions.enableAI !== false) {
                this.processDocumentAsync(document.id, file.buffer, processingOptions);
            }
            if (processingOptions.notifyUsers !== false) {
                this.sendUploadNotifications(document, uploadedById);
            }
            return {
                id: document.id,
                name: document.originalName,
                url: uploadResult.url,
                type: document.type,
                processingStatus: document.processingStatus,
            };
        }
        catch (error) {
            this.logger.error(`Document upload failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getDocument(documentId, userId) {
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                OR: [
                    { uploadedById: userId },
                    { listing: { sellerId: userId } },
                    { listing: { agentId: userId } },
                    { offer: { buyerId: userId } },
                    { escrow: { offer: { buyerId: userId } } },
                    { escrow: { offer: { listing: { sellerId: userId } } } },
                ],
            },
            include: {
                listing: true,
                offer: true,
                escrow: true,
                milestone: true,
                uploadedBy: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });
        if (!document) {
            throw new BadRequestException('Document not found or access denied');
        }
        const downloadUrl = await this.s3Service.getSignedDownloadUrl(document.s3Key);
        return {
            ...document,
            downloadUrl,
        };
    }
    async getDocuments(filters) {
        const whereClause = {};
        if (filters.listingId)
            whereClause.listingId = filters.listingId;
        if (filters.offerId)
            whereClause.offerId = filters.offerId;
        if (filters.escrowId)
            whereClause.escrowId = filters.escrowId;
        if (filters.milestoneId)
            whereClause.milestoneId = filters.milestoneId;
        if (filters.type)
            whereClause.type = filters.type;
        if (filters.userId) {
            whereClause.OR = [
                { uploadedById: filters.userId },
                { listing: { sellerId: filters.userId } },
                { listing: { agentId: filters.userId } },
                { offer: { buyerId: filters.userId } },
                { escrow: { offer: { buyerId: filters.userId } } },
                { escrow: { offer: { listing: { sellerId: filters.userId } } } },
            ];
        }
        return this.prisma.document.findMany({
            where: whereClause,
            include: {
                uploadedBy: {
                    select: { id: true, fullName: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteDocument(documentId, userId) {
        const document = await this.prisma.document.findFirst({
            where: {
                id: documentId,
                uploadedById: userId,
            },
        });
        if (!document) {
            throw new BadRequestException('Document not found or access denied');
        }
        await this.s3Service.deleteFile(document.s3Key);
        await this.prisma.document.delete({
            where: { id: documentId },
        });
    }
    async processDocumentAsync(documentId, fileBuffer, options) {
        try {
            await this.prisma.document.update({
                where: { id: documentId },
                data: { processingStatus: DocumentProcessingStatus.PROCESSING },
            });
            const document = await this.prisma.document.findUnique({
                where: { id: documentId },
                include: { uploadedBy: true },
            });
            if (!document)
                return;
            const analysisResult = await this.aiService.analyzeDocument(fileBuffer, document.mimeType, document.originalName);
            await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    processingStatus: DocumentProcessingStatus.PROCESSED,
                    extractedData: analysisResult.extractedData,
                    aiSummary: analysisResult.summary,
                    aiCategory: analysisResult.category,
                    aiConfidenceScore: analysisResult.confidenceScore,
                },
            });
            if (options.notifyUsers !== false && document.uploadedById) {
                await this.notificationService.notifyDocumentProcessed(document.uploadedById, document);
            }
            this.websocketGateway.notifyDocumentProcessed(documentId, document.listingId || '', document.escrowId || '', analysisResult);
        }
        catch (error) {
            this.logger.error(`Document processing failed for ${documentId}: ${error.message}`, error.stack);
            await this.prisma.document.update({
                where: { id: documentId },
                data: {
                    processingStatus: DocumentProcessingStatus.FAILED,
                    processingError: error.message,
                },
            });
        }
    }
    validateFile(file) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }
        if (file.size > this.maxFileSize) {
            throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
        }
        const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
        if (!this.allowedTypes.includes(fileExtension)) {
            throw new BadRequestException(`File type ${fileExtension} is not allowed. Allowed types: ${this.allowedTypes.join(', ')}`);
        }
    }
    determineDocumentType(filename, mimeType) {
        const lowerFilename = filename.toLowerCase();
        if (mimeType.includes('image/')) {
            if (lowerFilename.includes('floor') || lowerFilename.includes('plan')) {
                return DocumentType.FLOOR_PLANS;
            }
            return DocumentType.PROPERTY_PHOTOS;
        }
        if (mimeType.includes('pdf') || mimeType.includes('document')) {
            if (lowerFilename.includes('contract') || lowerFilename.includes('agreement')) {
                return DocumentType.CONTRACT;
            }
            if (lowerFilename.includes('inspection')) {
                return DocumentType.INSPECTION_REPORT;
            }
            if (lowerFilename.includes('disclosure')) {
                return DocumentType.DISCLOSURE;
            }
            if (lowerFilename.includes('appraisal')) {
                return DocumentType.APPRAISAL;
            }
            if (lowerFilename.includes('insurance')) {
                return DocumentType.INSURANCE;
            }
            if (lowerFilename.includes('financial') || lowerFilename.includes('loan')) {
                return DocumentType.FINANCIAL;
            }
            if (lowerFilename.includes('mls')) {
                return DocumentType.MLS_SHEET;
            }
        }
        return DocumentType.OTHER;
    }
    async sendUploadNotifications(document, uploadedById) {
        try {
            const usersToNotify = await this.getUsersToNotify(document);
            for (const userId of usersToNotify) {
                if (userId !== uploadedById) {
                    await this.notificationService.notifyDocumentUploaded(userId, document);
                }
            }
            this.websocketGateway.notifyDocumentUploaded(document.listingId, document.escrowId, document);
        }
        catch (error) {
            this.logger.error(`Failed to send upload notifications: ${error.message}`, error.stack);
        }
    }
    async getUsersToNotify(document) {
        const userIds = new Set();
        if (document.listingId) {
            const listing = await this.prisma.listing.findUnique({
                where: { id: document.listingId },
                select: { sellerId: true, agentId: true },
            });
            if (listing) {
                userIds.add(listing.sellerId);
                if (listing.agentId)
                    userIds.add(listing.agentId);
            }
        }
        if (document.offerId) {
            const offer = await this.prisma.offer.findUnique({
                where: { id: document.offerId },
                select: { buyerId: true, listing: { select: { sellerId: true, agentId: true } } },
            });
            if (offer) {
                userIds.add(offer.buyerId);
                userIds.add(offer.listing.sellerId);
                if (offer.listing.agentId)
                    userIds.add(offer.listing.agentId);
            }
        }
        if (document.escrowId) {
            const escrow = await this.prisma.escrow.findUnique({
                where: { id: document.escrowId },
                select: {
                    offer: {
                        select: {
                            buyerId: true,
                            listing: { select: { sellerId: true, agentId: true } },
                        },
                    },
                },
            });
            if (escrow) {
                userIds.add(escrow.offer.buyerId);
                userIds.add(escrow.offer.listing.sellerId);
                if (escrow.offer.listing.agentId)
                    userIds.add(escrow.offer.listing.agentId);
            }
        }
        return Array.from(userIds);
    }
    async generateThumbnail(documentId) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!document || !document.mimeType.includes('image/')) {
            throw new BadRequestException('Document not found or not an image');
        }
        try {
            const imageBuffer = await this.s3Service.downloadFile(document.s3Key);
            const thumbnailBuffer = await sharp(imageBuffer)
                .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
            const thumbnailKey = `thumbnails/${document.name}`;
            const uploadResult = await this.s3Service.uploadFile(thumbnailBuffer, thumbnailKey, 'image/jpeg');
            return uploadResult.url;
        }
        catch (error) {
            this.logger.error(`Thumbnail generation failed: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to generate thumbnail');
        }
    }
};
DocumentService = DocumentService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        AIService,
        NotificationService,
        WebSocketGateway,
        S3Service,
        ConfigService])
], DocumentService);
export { DocumentService };
//# sourceMappingURL=document.service.js.map