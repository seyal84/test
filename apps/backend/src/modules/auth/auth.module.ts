import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

@Module({
	imports: [JwtModule.register({})],
	providers: [AuthService, JwtAuthGuard, RolesGuard],
	exports: [AuthService, JwtAuthGuard, RolesGuard],
	controllers: [AuthController],
})
export class AuthModule {}