import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  etag?: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBucket: string;

  constructor(private configService: ConfigService) {
    this.client = new S3Client({ 
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
    
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
    this.publicBucket = this.configService.get<string>('AWS_S3_PUBLIC_BUCKET') || '';
  }

  async getPresignedUploadUrl(key: string, contentType: string, isPublic: boolean = false): Promise<{
    url: string;
    fields: null;
    key: string;
    bucket: string;
  }> {
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
    } catch (error) {
      this.logger.error(`Failed to generate presigned upload URL: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadFile(
    buffer: Buffer, 
    key: string, 
    contentType: string, 
    isPublic: boolean = false
  ): Promise<UploadResult> {
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
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async downloadFile(key: string, isPublic: boolean = false): Promise<Buffer> {
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

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to download file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600, isPublic: boolean = false): Promise<string> {
    try {
      const bucketName = isPublic ? this.publicBucket : this.bucket;
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate signed download URL: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteFile(key: string, isPublic: boolean = false): Promise<void> {
    try {
      const bucketName = isPublic ? this.publicBucket : this.bucket;
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await this.client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async fileExists(key: string, isPublic: boolean = false): Promise<boolean> {
    try {
      const bucketName = isPublic ? this.publicBucket : this.bucket;
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      this.logger.error(`Failed to check file existence: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFileMetadata(key: string, isPublic: boolean = false): Promise<{
    size: number;
    lastModified: Date;
    contentType: string;
    etag: string;
  }> {
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
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${error.message}`, error.stack);
      throw error;
    }
  }

  async copyFile(
    sourceKey: string, 
    destinationKey: string, 
    isPublic: boolean = false
  ): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Failed to copy file: ${error.message}`, error.stack);
      throw error;
    }
  }

  generatePublicUrl(key: string): string {
    return `https://${this.publicBucket}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
  }

  // Helper methods for specific use cases
  async uploadPropertyImage(
    buffer: Buffer, 
    listingId: string, 
    fileName: string,
    contentType: string = 'image/jpeg'
  ): Promise<UploadResult> {
    const key = `properties/${listingId}/images/${fileName}`;
    return this.uploadFile(buffer, key, contentType, true); // Public for property images
  }

  async uploadDocument(
    buffer: Buffer, 
    fileName: string,
    contentType: string
  ): Promise<UploadResult> {
    const key = `documents/${fileName}`;
    return this.uploadFile(buffer, key, contentType, false); // Private for documents
  }

  async uploadAvatar(
    buffer: Buffer, 
    userId: string, 
    fileName: string,
    contentType: string = 'image/jpeg'
  ): Promise<UploadResult> {
    const key = `avatars/${userId}/${fileName}`;
    return this.uploadFile(buffer, key, contentType, true); // Public for avatars
  }
}