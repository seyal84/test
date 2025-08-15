import { OffersService } from './offers.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
export declare class OffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
    submit(req: any, dto: CreateOfferDto): import(".prisma/client").Prisma.Prisma__OfferClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string;
        amount: number;
        status: string;
        listingId: string;
    }, never, import("@prisma/client/runtime/library.js").DefaultArgs>;
    respond(id: string, action: 'accept' | 'decline' | 'counter', amount?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string;
        amount: number;
        status: string;
        listingId: string;
    }>;
    history(id: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        offerId: string;
        fromRole: string;
        message: string;
    }[]>;
}
