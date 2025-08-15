var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
let S3Service = class S3Service {
    client = new S3Client({ region: process.env.AWS_REGION });
    bucket = process.env.S3_BUCKET;
    async getPresignedUploadUrl(key, contentType) {
        const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
        const url = await getSignedUrl(this.client, cmd, { expiresIn: 300 });
        return { url, fields: null, key, bucket: this.bucket };
    }
};
S3Service = __decorate([
    Injectable()
], S3Service);
export { S3Service };
//# sourceMappingURL=s3.service.js.map