import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    url: string;
    key: string;
    bucket: string;
    etag?: string;
}
export declare class S3Service {
    private configService;
    private readonly logger;
    private readonly client;
    private readonly bucket;
    private readonly publicBucket;
    constructor(configService: ConfigService);
    getPresignedUploadUrl(key: string, contentType: string, isPublic?: boolean): Promise<{
        url: string;
        fields: null;
        key: string;
        bucket: string;
    }>;
    uploadFile(buffer: Buffer, key: string, contentType: string, isPublic?: boolean): Promise<UploadResult>;
    downloadFile(key: string, isPublic?: boolean): Promise<Buffer>;
    getSignedDownloadUrl(key: string, expiresIn?: number, isPublic?: boolean): Promise<string>;
    deleteFile(key: string, isPublic?: boolean): Promise<void>;
    fileExists(key: string, isPublic?: boolean): Promise<boolean>;
    getFileMetadata(key: string, isPublic?: boolean): Promise<{
        size: number;
        lastModified: Date;
        contentType: string;
        etag: string;
    }>;
    copyFile(sourceKey: string, destinationKey: string, isPublic?: boolean): Promise<void>;
    generatePublicUrl(key: string): string;
    uploadPropertyImage(buffer: Buffer, listingId: string, fileName: string, contentType?: string): Promise<UploadResult>;
    uploadDocument(buffer: Buffer, fileName: string, contentType: string): Promise<UploadResult>;
    uploadAvatar(buffer: Buffer, userId: string, fileName: string, contentType?: string): Promise<UploadResult>;
}
