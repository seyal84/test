import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrationsService {
	mlsSync(payload: any) {
		return { synced: true, received: payload, at: new Date().toISOString() };
	}

	stripeCreateIntent(amount: number) {
		return { clientSecret: `pi_${Date.now()}_secret_dummy`, amount };
	}

	docusignRequest(envelope: { subject: string; recipients: string[] }) {
		return { envelopeId: `env_${Date.now()}`, ...envelope, status: 'sent' };
	}
}