import { EscrowService } from './escrow.service.js';
import { EscrowStatus } from '../../common/constants.js';
export declare class EscrowController {
    private readonly escrowService;
    constructor(escrowService: EscrowService);
    getByOffer(offerId: string): import(".prisma/client").Prisma.Prisma__EscrowClient<({
        documents: {
            id: string;
            createdAt: Date;
            name: string;
            s3Key: string;
            escrowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        offerId: string;
    }) | null, null, import("@prisma/client/runtime/library.js").DefaultArgs>;
    addDoc(escrowId: string, body: {
        name: string;
        s3Key: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        s3Key: string;
        escrowId: string;
    }>;
    setStatus(id: string, body: {
        status: EscrowStatus;
    }): import(".prisma/client").Prisma.Prisma__EscrowClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        offerId: string;
    }, never, import("@prisma/client/runtime/library.js").DefaultArgs>;
}
