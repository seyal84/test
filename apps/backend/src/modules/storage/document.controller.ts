import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../../common/rbac.decorator.js';
import { DocumentService } from './document.service.js';
import { DocumentType, UserRole } from '@prisma/client';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ 
            fileType: /\.(pdf|doc|docx|jpg|jpeg|png|bmp|tiff|xlsx|csv)$/i 
          }),
        ],
      })
    ) file: Express.Multer.File,
    @Body() body: {
      listingId?: string;
      offerId?: string;
      escrowId?: string;
      milestoneId?: string;
      type?: DocumentType;
      enableAI?: boolean;
      notifyUsers?: boolean;
    },
    @Req() req: any
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.documentService.uploadDocument(
      file,
      req.user.sub,
      {
        listingId: body.listingId,
        offerId: body.offerId,
        escrowId: body.escrowId,
        milestoneId: body.milestoneId,
        type: body.type,
      },
      {
        enableAI: body.enableAI,
        notifyUsers: body.notifyUsers,
      }
    );
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleDocuments(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB per file
        ],
      })
    ) files: Express.Multer.File[],
    @Body() body: {
      listingId?: string;
      offerId?: string;
      escrowId?: string;
      milestoneId?: string;
      enableAI?: boolean;
      notifyUsers?: boolean;
    },
    @Req() req: any
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map(file => 
      this.documentService.uploadDocument(
        file,
        req.user.sub,
        {
          listingId: body.listingId,
          offerId: body.offerId,
          escrowId: body.escrowId,
          milestoneId: body.milestoneId,
        },
        {
          enableAI: body.enableAI,
          notifyUsers: body.notifyUsers,
        }
      )
    );

    return Promise.all(uploadPromises);
  }

  @Get()
  async getDocuments(
    @Query() query: {
      listingId?: string;
      offerId?: string;
      escrowId?: string;
      milestoneId?: string;
      type?: DocumentType;
    },
    @Req() req: any
  ) {
    return this.documentService.getDocuments({
      ...query,
      userId: req.user.sub,
    });
  }

  @Get(':id')
  async getDocument(
    @Param('id') documentId: string,
    @Req() req: any
  ) {
    return this.documentService.getDocument(documentId, req.user.sub);
  }

  @Delete(':id')
  async deleteDocument(
    @Param('id') documentId: string,
    @Req() req: any
  ) {
    await this.documentService.deleteDocument(documentId, req.user.sub);
    return { message: 'Document deleted successfully' };
  }

  @Post(':id/thumbnail')
  async generateThumbnail(
    @Param('id') documentId: string,
    @Req() req: any
  ) {
    const thumbnailUrl = await this.documentService.generateThumbnail(documentId);
    return { thumbnailUrl };
  }

  @Get('listing/:listingId')
  async getListingDocuments(
    @Param('listingId') listingId: string,
    @Query('type') type?: DocumentType,
    @Req() req: any
  ) {
    return this.documentService.getDocuments({
      listingId,
      type,
      userId: req.user.sub,
    });
  }

  @Get('offer/:offerId')
  async getOfferDocuments(
    @Param('offerId') offerId: string,
    @Query('type') type?: DocumentType,
    @Req() req: any
  ) {
    return this.documentService.getDocuments({
      offerId,
      type,
      userId: req.user.sub,
    });
  }

  @Get('escrow/:escrowId')
  async getEscrowDocuments(
    @Param('escrowId') escrowId: string,
    @Query('type') type?: DocumentType,
    @Req() req: any
  ) {
    return this.documentService.getDocuments({
      escrowId,
      type,
      userId: req.user.sub,
    });
  }

  @Get('milestone/:milestoneId')
  async getMilestoneDocuments(
    @Param('milestoneId') milestoneId: string,
    @Query('type') type?: DocumentType,
    @Req() req: any
  ) {
    return this.documentService.getDocuments({
      milestoneId,
      type,
      userId: req.user.sub,
    });
  }

  // Admin endpoints
  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  async getAllDocuments(
    @Query() query: {
      page?: number;
      limit?: number;
      type?: DocumentType;
      processingStatus?: string;
    }
  ) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // This would need to be implemented in the service
    return { message: 'Admin document listing not yet implemented' };
  }

  @Post('admin/:id/reprocess')
  @Roles(UserRole.ADMIN)
  async reprocessDocument(
    @Param('id') documentId: string
  ) {
    // This would trigger AI reprocessing
    return { message: 'Document reprocessing not yet implemented' };
  }
}