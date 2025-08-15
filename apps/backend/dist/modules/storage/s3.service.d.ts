export declare class S3Service {
    private client;
    private bucket;
    getPresignedUploadUrl(key: string, contentType: string): Promise<{
        url: string;
        fields: null;
        key: string;
        bucket: string;
    }>;
}
