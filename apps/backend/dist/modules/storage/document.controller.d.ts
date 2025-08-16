import { DocumentService } from './document.service.js';
import { DocumentType } from '@prisma/client';
export declare class DocumentController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    uploadDocument(file: Express.Multer.File, body: {
        listingId?: string;
        offerId?: string;
        escrowId?: string;
        milestoneId?: string;
        type?: DocumentType;
        enableAI?: boolean;
        notifyUsers?: boolean;
    }, req: any): Promise<import("./document.service.js").DocumentUploadResult>;
    uploadMultipleDocuments(files: Express.Multer.File[], body: {
        listingId?: string;
        offerId?: string;
        escrowId?: string;
        milestoneId?: string;
        enableAI?: boolean;
        notifyUsers?: boolean;
    }, req: any): Promise<import("./document.service.js").DocumentUploadResult[]>;
    getDocuments(query: {
        listingId?: string;
        offerId?: string;
        escrowId?: string;
        milestoneId?: string;
        type?: DocumentType;
    }, req: any): Promise<any>;
    getDocument(documentId: string, req: any): Promise<any>;
    deleteDocument(documentId: string, req: any): Promise<{
        message: string;
    }>;
    generateThumbnail(documentId: string, req: any): Promise<{
        thumbnailUrl: string;
    }>;
    getListingDocuments(listingId: string, type?: DocumentType, req: any): Promise<any>;
    getOfferDocuments(offerId: string, type?: DocumentType, req: any): Promise<any>;
    getEscrowDocuments(escrowId: string, type?: DocumentType, req: any): Promise<any>;
    getMilestoneDocuments(milestoneId: string, type?: DocumentType, req: any): Promise<any>;
    getAllDocuments(query: {
        page?: number;
        limit?: number;
        type?: DocumentType;
        processingStatus?: string;
    }): Promise<{
        message: string;
    }>;
    reprocessDocument(documentId: string): Promise<{
        message: string;
    }>;
}
