import { PrismaService } from '../../common/prisma.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UserRole } from '@prisma/client';
export declare class OffersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    submit(buyerId: string, dto: CreateOfferDto): any;
    respond(offerId: string, actorRole: UserRole, action: 'accept' | 'decline' | 'counter', amount?: number): Promise<any>;
    history(offerId: string): any;
}
