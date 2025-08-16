import { ListingsService } from './listings.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    list(q?: string, min?: string, max?: string): Promise<any>;
    create(req: any, dto: CreateListingDto): Promise<any>;
    update(id: string, dto: Partial<CreateListingDto>): Promise<any>;
    remove(id: string): any;
}
