export declare class IntegrationsService {
    mlsSync(payload: any): {
        synced: boolean;
        received: any;
        at: string;
    };
    stripeCreateIntent(amount: number): {
        clientSecret: string;
        amount: number;
    };
    docusignRequest(envelope: {
        subject: string;
        recipients: string[];
    }): {
        status: string;
        subject: string;
        recipients: string[];
        envelopeId: string;
    };
}
