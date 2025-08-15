export declare class ServicesService {
    private providers;
    list(): {
        id: string;
        name: string;
        specialty: string;
        phone: string;
    }[];
    book(providerId: string, details: {
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
