import { PrismaService } from '../../common/prisma.service.js';
import { EscrowStatus } from '@prisma/client';
export declare class EscrowService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getByOffer(offerId: string): any;
    addDocument(escrowId: string, name: string, s3Key: string): Promise<any>;
    setStatus(escrowId: string, status: EscrowStatus): any;
}
