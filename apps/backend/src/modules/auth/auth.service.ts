import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

@Injectable()
export class AuthService {
	private jwks = process.env.COGNITO_JWKS_URI ? createRemoteJWKSet(new URL(process.env.COGNITO_JWKS_URI)) : null;
	private issuer = process.env.COGNITO_ISSUER || process.env.JWT_ISSUER;
	private audience = process.env.COGNITO_CLIENT_ID || process.env.JWT_AUDIENCE;

	async verifyToken(token: string): Promise<JWTPayload> {
		if (!this.jwks || !this.issuer) {
			throw new UnauthorizedException('Auth not configured');
		}
		try {
			const { payload } = await jwtVerify(token, this.jwks, {
				issuer: this.issuer,
				audience: this.audience,
			});
			return payload;
		} catch (e) {
			throw new UnauthorizedException('Invalid token');
		}
	}
}