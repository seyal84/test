import { AuthService } from './auth.service.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    health(): {
        jwksConfigured: boolean;
        issuer: string | undefined;
    };
    me(auth?: string): Promise<{
        payload: import("jose").JWTPayload;
    }>;
}
