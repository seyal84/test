import { PrismaService } from '../../common/prisma.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
export declare class ListingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(params?: {
        q?: string;
        min?: number;
        max?: number;
    }): Promise<any>;
    create(sellerId: string, dto: CreateListingDto): Promise<any>;
    update(id: string, dto: Partial<CreateListingDto>): Promise<any>;
    remove(id: string): any;
    private enhanceTags;
}
