import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { S3Service } from './s3.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class S3Controller {
	constructor(private readonly s3Service: S3Service) {}

	@Post('presign')
	presign(@Body() body: { key: string; contentType: string }) {
		return this.s3Service.getPresignedUploadUrl(body.key, body.contentType);
	}
}