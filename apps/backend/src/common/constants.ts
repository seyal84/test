export const UserRole = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
  ADMIN: 'ADMIN',
} as const;

export const OfferStatus = {
  PENDING: 'PENDING',
  COUNTERED: 'COUNTERED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
} as const;

export const EscrowStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
export type OfferStatus = typeof OfferStatus[keyof typeof OfferStatus];
export type EscrowStatus = typeof EscrowStatus[keyof typeof EscrowStatus];