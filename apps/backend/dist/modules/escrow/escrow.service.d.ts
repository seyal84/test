import { PrismaService } from '../../common/prisma.service.js';
import { EscrowStatus } from '../../common/constants.js';
export declare class EscrowService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    addDocument(escrowId: string, name: string, s3Key: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        s3Key: string;
        escrowId: string;
    }>;
    setStatus(escrowId: string, status: EscrowStatus): import(".prisma/client").Prisma.Prisma__EscrowClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        offerId: string;
    }, never, import("@prisma/client/runtime/library.js").DefaultArgs>;
}
