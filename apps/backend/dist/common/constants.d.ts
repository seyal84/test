export declare const UserRole: {
    readonly BUYER: "BUYER";
    readonly SELLER: "SELLER";
    readonly SERVICE_PROVIDER: "SERVICE_PROVIDER";
    readonly ADMIN: "ADMIN";
};
export declare const OfferStatus: {
    readonly PENDING: "PENDING";
    readonly COUNTERED: "COUNTERED";
    readonly ACCEPTED: "ACCEPTED";
    readonly DECLINED: "DECLINED";
};
export declare const EscrowStatus: {
    readonly OPEN: "OPEN";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly CLOSED: "CLOSED";
};
export type UserRole = typeof UserRole[keyof typeof UserRole];
export type OfferStatus = typeof OfferStatus[keyof typeof OfferStatus];
export type EscrowStatus = typeof EscrowStatus[keyof typeof EscrowStatus];
