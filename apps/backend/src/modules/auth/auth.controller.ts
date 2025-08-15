import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get('health')
	health() {
		return { jwksConfigured: Boolean(process.env.COGNITO_JWKS_URI), issuer: process.env.COGNITO_ISSUER };
	}

	@Get('me')
	async me(@Headers('authorization') auth?: string) {
		if (!auth) throw new UnauthorizedException('Missing token');
		const token = auth.replace('Bearer ', '');
		const payload = await this.authService.verifyToken(token);
		return { payload };
	}
}