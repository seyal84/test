var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3Service_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
let S3Service = S3Service_1 = class S3Service {
    configService;
    logger = new Logger(S3Service_1.name);
    client;
    bucket;
    publicBucket;
    constructor(configService) {
        this.configService = configService;
        this.client = new S3Client({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
            },
        });
        this.bucket = this.configService.get('AWS_S3_BUCKET') || '';
        this.publicBucket = this.configService.get('AWS_S3_PUBLIC_BUCKET') || '';
    }
    async getPresignedUploadUrl(key, contentType, isPublic = false) {
        try {
            const bucketName = isPublic ? this.publicBucket : this.bucket;
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                ContentType: contentType,
                ACL: isPublic ? 'public-read' : 'private',
            });
            const url = await getSignedUrl(this.client, command, { expiresIn: 300 });
            return {
                url,
                fields: null,
                key,
                bucket: bucketName
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate presigned upload URL: ${error.message}`, error.stack);
            throw error;
        }
    }
    async uploadFile(buffer, key, contentType, isPublic = false) {
        try {
            const bucketName = isPublic ? this.publicBucket : this.bucket;
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                ACL: isPublic ? 'public-read' : 'private',
            });
            const response = await this.client.send(command);
            const url = isPublic
                ? `https://${bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`
                : await this.getSignedDownloadUrl(key);
            this.logger.log(`File uploaded successfully: ${key}`);
            return {
                url,
                key,
                bucket: bucketName,
                etag: response.ETag,
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async downloadFile(key, isPublic = false) {
        try {
            const bucketName = isPublic ? this.publicBucket : this.bucket;
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            });
            const response = await this.client.send(command);
            if (!response.Body) {
                throw new Error('No file body returned');
            }
            const chunks = [];
            const stream = response.Body;
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        }
        catch (error) {
            this.logger.error(`Failed to download file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSignedDownloadUrl(key, expiresIn = 3600, isPublic = false) {
        try {
            const bucketName = isPublic ? this.publicBucket : this.bucket;
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
            });
            return await getSignedUrl(this.client, command, { expiresIn });
        }
        catch (error) {
            this.logger.error(`Failed to generate signed download URL: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteFile(key, isPublic = false) {
        try {
            const bucketName = isPublic ? this.publicBucket : this.bucket;
            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            });
            await this.client.send(command);
            this.logger.log(`File deleted successfully: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async fileExists(key, isPublic = false) {
        try {
            const bucketName = isPublic ? this.publicBucket : this.bucket;
            const command = new HeadObjectCommand({
                Bucket: bucketName,
                Key: key,
            });
            await this.client.send(command);
            return true;
        }
        catch (error) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return false;
            }
            this.logger.error(`Failed to check file existence: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getFileMetadata(key, isPublic = false) {
        try {
            const bucketName = isPublic ? this.publicBucket : this.bucket;
            const command = new HeadObjectCommand({
                Bucket: bucketName,
                Key: key,
            });
            const response = await this.client.send(command);
            return {
                size: response.ContentLength || 0,
                lastModified: response.LastModified || new Date(),
                contentType: response.ContentType || 'application/octet-stream',
                etag: response.ETag || '',
            };
        }
        catch (error) {
            this.logger.error(`Failed to get file metadata: ${error.message}`, error.stack);
            throw error;
        }
    }
    async copyFile(sourceKey, destinationKey, isPublic = false) {
        try {
            const bucketName = isPublic ? this.publicBucket : this.bucket;
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: destinationKey,
                CopySource: `${bucketName}/${sourceKey}`,
                ACL: isPublic ? 'public-read' : 'private',
            });
            await this.client.send(command);
            this.logger.log(`File copied successfully: ${sourceKey} -> ${destinationKey}`);
        }
        catch (error) {
            this.logger.error(`Failed to copy file: ${error.message}`, error.stack);
            throw error;
        }
    }
    generatePublicUrl(key) {
        return `https://${this.publicBucket}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
    }
    async uploadPropertyImage(buffer, listingId, fileName, contentType = 'image/jpeg') {
        const key = `properties/${listingId}/images/${fileName}`;
        return this.uploadFile(buffer, key, contentType, true);
    }
    async uploadDocument(buffer, fileName, contentType) {
        const key = `documents/${fileName}`;
        return this.uploadFile(buffer, key, contentType, false);
    }
    async uploadAvatar(buffer, userId, fileName, contentType = 'image/jpeg') {
        const key = `avatars/${userId}/${fileName}`;
        return this.uploadFile(buffer, key, contentType, true);
    }
};
S3Service = S3Service_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], S3Service);
export { S3Service };
//# sourceMappingURL=s3.service.js.map