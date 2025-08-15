import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/rbac.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}
		const { user } = context.switchToHttp().getRequest();
		if (!user) return false;
		const rolesFromToken = this.extractRoles(user);
		return requiredRoles.some((r) => rolesFromToken.includes(r));
	}

	private extractRoles(payload: any): string[] {
		const groups = payload['cognito:groups'] || payload['roles'] || payload['custom:roles'] || [];
		return Array.isArray(groups) ? groups : typeof groups === 'string' ? groups.split(',') : [];
	}
}