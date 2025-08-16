import { IntegrationsService } from './integrations.service.js';
export declare class IntegrationsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    mlsSync(body: any): {
        synced: boolean;
        received: any;
        at: string;
    };
    paymentIntent(body: {
        amount: number;
    }): {
        clientSecret: string;
        amount: number;
    };
    esign(body: {
        subject: string;
        recipients: string[];
    }): {
        status: string;
        subject: string;
        recipients: string[];
        envelopeId: string;
    };
}
