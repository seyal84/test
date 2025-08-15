import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller.js';
import { IntegrationsService } from './integrations.service.js';

@Module({
	controllers: [IntegrationsController],
	providers: [IntegrationsService],
})
export class IntegrationsModule {}