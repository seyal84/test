import { PrismaService } from '../../common/prisma.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UserRole } from '../../common/constants.js';
export declare class OffersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    submit(buyerId: string, dto: CreateOfferDto): import(".prisma/client").Prisma.Prisma__OfferClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string;
        amount: number;
        status: string;
        listingId: string;
    }, never, import("@prisma/client/runtime/library.js").DefaultArgs>;
    respond(offerId: string, actorRole: UserRole, action: 'accept' | 'decline' | 'counter', amount?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string;
        amount: number;
        status: string;
        listingId: string;
    }>;
    history(offerId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        offerId: string;
        fromRole: string;
        message: string;
    }[]>;
}
