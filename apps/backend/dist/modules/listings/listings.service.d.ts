import { PrismaService } from '../../common/prisma.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
export declare class ListingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(params?: {
        q?: string;
        min?: number;
        max?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string;
        description: string;
        price: number;
        images: string;
        tags: string;
    }[]>;
    create(sellerId: string, dto: CreateListingDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string;
        description: string;
        price: number;
        images: string;
        tags: string;
    }>;
    update(id: string, dto: Partial<CreateListingDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string;
        description: string;
        price: number;
        images: string;
        tags: string;
    }>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ListingClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string;
        description: string;
        price: number;
        images: string;
        tags: string;
    }, never, import("@prisma/client/runtime/library.js").DefaultArgs>;
    private enhanceTags;
    private basicTagging;
}
