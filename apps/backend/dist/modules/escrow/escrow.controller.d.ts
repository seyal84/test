import { EscrowService } from './escrow.service.js';
import { EscrowStatus } from '@prisma/client';
export declare class EscrowController {
    private readonly escrowService;
    constructor(escrowService: EscrowService);
    getByOffer(offerId: string): any;
    addDoc(escrowId: string, body: {
        name: string;
        s3Key: string;
    }): Promise<any>;
    setStatus(id: string, body: {
        status: EscrowStatus;
    }): any;
}
