import { PrismaService } from '../../common/prisma.service.js';
import { UserRole } from '../../common/constants.js';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null, null, import("@prisma/client/runtime/library.js").DefaultArgs>;
    upsertUser(email: string, fullName: string, role: UserRole): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    anonymizeUser(userId: string): Promise<[import(".prisma/client").Prisma.BatchPayload, import(".prisma/client").Prisma.BatchPayload, {
        id: string;
        email: string;
        fullName: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }]>;
}
