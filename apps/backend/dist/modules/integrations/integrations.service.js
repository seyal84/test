var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
let IntegrationsService = class IntegrationsService {
    mlsSync(payload) {
        return { synced: true, received: payload, at: new Date().toISOString() };
    }
    stripeCreateIntent(amount) {
        return { clientSecret: `pi_${Date.now()}_secret_dummy`, amount };
    }
    docusignRequest(envelope) {
        return { envelopeId: `env_${Date.now()}`, ...envelope, status: 'sent' };
    }
};
IntegrationsService = __decorate([
    Injectable()
], IntegrationsService);
export { IntegrationsService };
//# sourceMappingURL=integrations.service.js.map