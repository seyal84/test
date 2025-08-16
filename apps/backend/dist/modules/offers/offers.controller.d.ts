import { OffersService } from './offers.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
export declare class OffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
    submit(req: any, dto: CreateOfferDto): any;
    respond(id: string, action: 'accept' | 'decline' | 'counter', amount?: string): Promise<any>;
    history(id: string): any;
}
