import { JWTPayload } from 'jose';
export declare class AuthService {
    private jwks;
    private issuer;
    private audience;
    verifyToken(token: string): Promise<JWTPayload>;
}
