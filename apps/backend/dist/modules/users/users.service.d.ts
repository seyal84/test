import { PrismaService } from '../../common/prisma.service.js';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): any;
    upsertUser(email: string, fullName: string, role: UserRole): Promise<any>;
    anonymizeUser(userId: string): Promise<any>;
}
