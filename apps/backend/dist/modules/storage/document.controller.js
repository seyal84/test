var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
import { Controller, Post, Get, Delete, Param, Query, Body, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException, Req, } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../../common/rbac.decorator.js';
import { DocumentService } from './document.service.js';
import { DocumentType, UserRole } from '@prisma/client';
let DocumentController = class DocumentController {
    documentService;
    constructor(documentService) {
        this.documentService = documentService;
    }
    async uploadDocument(file, body, req) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }
        return this.documentService.uploadDocument(file, req.user.sub, {
            listingId: body.listingId,
            offerId: body.offerId,
            escrowId: body.escrowId,
            milestoneId: body.milestoneId,
            type: body.type,
        }, {
            enableAI: body.enableAI,
            notifyUsers: body.notifyUsers,
        });
    }
    async uploadMultipleDocuments(files, body, req) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }
        const uploadPromises = files.map(file => this.documentService.uploadDocument(file, req.user.sub, {
            listingId: body.listingId,
            offerId: body.offerId,
            escrowId: body.escrowId,
            milestoneId: body.milestoneId,
        }, {
            enableAI: body.enableAI,
            notifyUsers: body.notifyUsers,
        }));
        return Promise.all(uploadPromises);
    }
    async getDocuments(query, req) {
        return this.documentService.getDocuments({
            ...query,
            userId: req.user.sub,
        });
    }
    async getDocument(documentId, req) {
        return this.documentService.getDocument(documentId, req.user.sub);
    }
    async deleteDocument(documentId, req) {
        await this.documentService.deleteDocument(documentId, req.user.sub);
        return { message: 'Document deleted successfully' };
    }
    async generateThumbnail(documentId, req) {
        const thumbnailUrl = await this.documentService.generateThumbnail(documentId);
        return { thumbnailUrl };
    }
    async getListingDocuments(listingId, type, req) {
        return this.documentService.getDocuments({
            listingId,
            type,
            userId: req.user.sub,
        });
    }
    async getOfferDocuments(offerId, type, req) {
        return this.documentService.getDocuments({
            offerId,
            type,
            userId: req.user.sub,
        });
    }
    async getEscrowDocuments(escrowId, type, req) {
        return this.documentService.getDocuments({
            escrowId,
            type,
            userId: req.user.sub,
        });
    }
    async getMilestoneDocuments(milestoneId, type, req) {
        return this.documentService.getDocuments({
            milestoneId,
            type,
            userId: req.user.sub,
        });
    }
    async getAllDocuments(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const offset = (page - 1) * limit;
        return { message: 'Admin document listing not yet implemented' };
    }
    async reprocessDocument(documentId) {
        return { message: 'Document reprocessing not yet implemented' };
    }
};
__decorate([
    Post('upload'),
    UseInterceptors(FileInterceptor('file')),
    __param(0, UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
            new FileTypeValidator({
                fileType: /\.(pdf|doc|docx|jpg|jpeg|png|bmp|tiff|xlsx|csv)$/i
            }),
        ],
    }))),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "uploadDocument", null);
__decorate([
    Post('upload-multiple'),
    UseInterceptors(FilesInterceptor('files', 10)),
    __param(0, UploadedFiles(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
        ],
    }))),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "uploadMultipleDocuments", null);
__decorate([
    Get(),
    __param(0, Query()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDocuments", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDocument", null);
__decorate([
    Delete(':id'),
    __param(0, Param('id')),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "deleteDocument", null);
__decorate([
    Post(':id/thumbnail'),
    __param(0, Param('id')),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "generateThumbnail", null);
__decorate([
    Get('listing/:listingId'),
    __param(0, Param('listingId')),
    __param(1, Query('type')),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof DocumentType !== "undefined" && DocumentType) === "function" ? _a : Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getListingDocuments", null);
__decorate([
    Get('offer/:offerId'),
    __param(0, Param('offerId')),
    __param(1, Query('type')),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof DocumentType !== "undefined" && DocumentType) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getOfferDocuments", null);
__decorate([
    Get('escrow/:escrowId'),
    __param(0, Param('escrowId')),
    __param(1, Query('type')),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof DocumentType !== "undefined" && DocumentType) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getEscrowDocuments", null);
__decorate([
    Get('milestone/:milestoneId'),
    __param(0, Param('milestoneId')),
    __param(1, Query('type')),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof DocumentType !== "undefined" && DocumentType) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getMilestoneDocuments", null);
__decorate([
    Get('admin/all'),
    Roles(UserRole.ADMIN),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getAllDocuments", null);
__decorate([
    Post('admin/:id/reprocess'),
    Roles(UserRole.ADMIN),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "reprocessDocument", null);
DocumentController = __decorate([
    Controller('documents'),
    UseGuards(JwtAuthGuard),
    __metadata("design:paramtypes", [DocumentService])
], DocumentController);
export { DocumentController };
//# sourceMappingURL=document.controller.js.map