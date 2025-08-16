import { UsersService } from './users.service.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(email: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null, null, import("@prisma/client/runtime/library.js").DefaultArgs>;
    anonymize(id: string): Promise<[import(".prisma/client").Prisma.BatchPayload, import(".prisma/client").Prisma.BatchPayload, {
        id: string;
        email: string;
        fullName: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }]>;
}
