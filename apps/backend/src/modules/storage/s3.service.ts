import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
	private client = new S3Client({ region: process.env.AWS_REGION });
	private bucket = process.env.S3_BUCKET as string;

	async getPresignedUploadUrl(key: string, contentType: string) {
		const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
		const url = await getSignedUrl(this.client, cmd, { expiresIn: 300 });
		return { url, fields: null, key, bucket: this.bucket };
	}
}