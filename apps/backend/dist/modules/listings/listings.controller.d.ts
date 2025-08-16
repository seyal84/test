import { ListingsService } from './listings.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    list(q?: string, min?: string, max?: string): Promise<{
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
    create(req: any, dto: CreateListingDto): Promise<{
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
}
