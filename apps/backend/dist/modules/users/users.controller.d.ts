import { UsersService } from './users.service.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(email: string): any;
    anonymize(id: string): Promise<any>;
}
