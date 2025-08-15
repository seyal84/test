import { ServicesService } from './services.service.js';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    list(): {
        id: string;
        name: string;
        specialty: string;
        phone: string;
    }[];
    book(id: string, body: {
        name: string;
        when: string;
        notes?: string;
    }): {
        providerId: string;
        confirmationId: string;
        details: {
            name: string;
            when: string;
            notes?: string;
        };
    };
}
