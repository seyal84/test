var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
let AuthService = class AuthService {
    jwks = process.env.COGNITO_JWKS_URI ? createRemoteJWKSet(new URL(process.env.COGNITO_JWKS_URI)) : null;
    issuer = process.env.COGNITO_ISSUER || process.env.JWT_ISSUER;
    audience = process.env.COGNITO_CLIENT_ID || process.env.JWT_AUDIENCE;
    async verifyToken(token) {
        if (!this.jwks || !this.issuer) {
            throw new UnauthorizedException('Auth not configured');
        }
        try {
            const { payload } = await jwtVerify(token, this.jwks, {
                issuer: this.issuer,
                audience: this.audience,
            });
            return payload;
        }
        catch (e) {
            throw new UnauthorizedException('Invalid token');
        }
    }
};
AuthService = __decorate([
    Injectable()
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map