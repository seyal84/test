import { Body, Controller, Post } from '@nestjs/common';
import { IntegrationsService } from './integrations.service.js';

@Controller('integrations')
export class IntegrationsController {
	constructor(private readonly integrationsService: IntegrationsService) {}

	@Post('mls/sync')
	mlsSync(@Body() body: any) {
		return this.integrationsService.mlsSync(body);
	}

	@Post('stripe/payment-intent')
	paymentIntent(@Body() body: { amount: number }) {
		return this.integrationsService.stripeCreateIntent(body.amount);
	}

	@Post('docusign/request')
	esign(@Body() body: { subject: string; recipients: string[] }) {
		return this.integrationsService.docusignRequest(body);
	}
}