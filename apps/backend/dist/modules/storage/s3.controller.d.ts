import { S3Service } from './s3.service.js';
export declare class S3Controller {
    private readonly s3Service;
    constructor(s3Service: S3Service);
    presign(body: {
        key: string;
        contentType: string;
    }): Promise<{
        url: string;
        fields: null;
        key: string;
        bucket: string;
    }>;
}
