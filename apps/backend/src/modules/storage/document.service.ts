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

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly allowedTypes: string[];
  private readonly maxFileSize: number;

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private notificationService: NotificationService,
    private websocketGateway: WebSocketGateway,
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {
    this.allowedTypes = this.configService.get<string>('ALLOWED_FILE_TYPES', 'pdf,doc,docx,jpg,jpeg,png,bmp,tiff,xlsx,csv').split(',');
    this.maxFileSize = parseInt(this.configService.get<string>('MAX_DOCUMENT_SIZE', '50000000')); // 50MB default
  }

  async uploadDocument(
    file: Express.Multer.File,
    uploadedById: string,
    options: {
      listingId?: string;
      offerId?: string;
      escrowId?: string;
      milestoneId?: string;
      type?: DocumentType;
    } = {},
    processingOptions: DocumentProcessingOptions = {}
  ): Promise<DocumentUploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const s3Key = `documents/${fileName}`;

      // Upload to S3
      const uploadResult = await this.s3Service.uploadFile(file.buffer, s3Key, file.mimetype);

      // Determine document type
      const documentType = options.type || this.determineDocumentType(file.originalname, file.mimetype);

      // Create document record
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

      // Process document asynchronously
      if (processingOptions.enableAI !== false) {
        this.processDocumentAsync(document.id, file.buffer, processingOptions);
      }

      // Send notifications
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

    } catch (error) {
      this.logger.error(`Document upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getDocument(documentId: string, userId: string) {
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

    // Generate signed URL for download
    const downloadUrl = await this.s3Service.getSignedDownloadUrl(document.s3Key);

    return {
      ...document,
      downloadUrl,
    };
  }

  async getDocuments(filters: {
    listingId?: string;
    offerId?: string;
    escrowId?: string;
    milestoneId?: string;
    type?: DocumentType;
    userId?: string;
  }) {
    const whereClause: any = {};

    if (filters.listingId) whereClause.listingId = filters.listingId;
    if (filters.offerId) whereClause.offerId = filters.offerId;
    if (filters.escrowId) whereClause.escrowId = filters.escrowId;
    if (filters.milestoneId) whereClause.milestoneId = filters.milestoneId;
    if (filters.type) whereClause.type = filters.type;

    // Add user access control
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

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        uploadedById: userId, // Only allow uploader to delete
      },
    });

    if (!document) {
      throw new BadRequestException('Document not found or access denied');
    }

    // Delete from S3
    await this.s3Service.deleteFile(document.s3Key);

    // Delete from database
    await this.prisma.document.delete({
      where: { id: documentId },
    });
  }

  private async processDocumentAsync(
    documentId: string,
    fileBuffer: Buffer,
    options: DocumentProcessingOptions
  ): Promise<void> {
    try {
      // Update status to processing
      await this.prisma.document.update({
        where: { id: documentId },
        data: { processingStatus: DocumentProcessingStatus.PROCESSING },
      });

      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        include: { uploadedBy: true },
      });

      if (!document) return;

      // Process with AI
      const analysisResult = await this.aiService.analyzeDocument(
        fileBuffer,
        document.mimeType,
        document.originalName
      );

      // Update document with AI results
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

      // Send processing complete notification
      if (options.notifyUsers !== false && document.uploadedById) {
        await this.notificationService.notifyDocumentProcessed(
          document.uploadedById,
          document
        );
      }

      // Send real-time update
      this.websocketGateway.notifyDocumentProcessed(
        documentId,
        document.listingId || '',
        document.escrowId || '',
        analysisResult
      );

    } catch (error) {
      this.logger.error(`Document processing failed for ${documentId}: ${error.message}`, error.stack);
      
      // Update status to failed
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: DocumentProcessingStatus.FAILED,
          processingError: error.message,
        },
      });
    }
  }

  private validateFile(file: Express.Multer.File): void {
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

  private determineDocumentType(filename: string, mimeType: string): DocumentType {
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

  private async sendUploadNotifications(document: any, uploadedById: string): Promise<void> {
    try {
      // Get all users who should be notified about this document
      const usersToNotify = await this.getUsersToNotify(document);

      for (const userId of usersToNotify) {
        if (userId !== uploadedById) { // Don't notify the uploader
          await this.notificationService.notifyDocumentUploaded(userId, document);
        }
      }

      // Send real-time notification
      this.websocketGateway.notifyDocumentUploaded(
        document.listingId,
        document.escrowId,
        document
      );

    } catch (error) {
      this.logger.error(`Failed to send upload notifications: ${error.message}`, error.stack);
    }
  }

  private async getUsersToNotify(document: any): Promise<string[]> {
    const userIds = new Set<string>();

    if (document.listingId) {
      const listing = await this.prisma.listing.findUnique({
        where: { id: document.listingId },
        select: { sellerId: true, agentId: true },
      });
      if (listing) {
        userIds.add(listing.sellerId);
        if (listing.agentId) userIds.add(listing.agentId);
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
        if (offer.listing.agentId) userIds.add(offer.listing.agentId);
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
        if (escrow.offer.listing.agentId) userIds.add(escrow.offer.listing.agentId);
      }
    }

    return Array.from(userIds);
  }

  async generateThumbnail(documentId: string): Promise<string> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || !document.mimeType.includes('image/')) {
      throw new BadRequestException('Document not found or not an image');
    }

    try {
      // Download original image
      const imageBuffer = await this.s3Service.downloadFile(document.s3Key);

      // Generate thumbnail
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload thumbnail
      const thumbnailKey = `thumbnails/${document.name}`;
      const uploadResult = await this.s3Service.uploadFile(
        thumbnailBuffer,
        thumbnailKey,
        'image/jpeg'
      );

      return uploadResult.url;

    } catch (error) {
      this.logger.error(`Thumbnail generation failed: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to generate thumbnail');
    }
  }
}