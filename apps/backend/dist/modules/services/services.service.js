var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
let ServicesService = class ServicesService {
    providers = [
        { id: '1', name: 'Acme Home Inspectors', specialty: 'Inspection', phone: '555-1000' },
        { id: '2', name: 'Sunrise Title', specialty: 'Title & Escrow', phone: '555-2000' },
        { id: '3', name: 'CleanCo', specialty: 'Cleaning', phone: '555-3000' },
    ];
    list() {
        return this.providers;
    }
    book(providerId, details) {
        return { providerId, confirmationId: `bk_${Date.now()}`, details };
    }
};
ServicesService = __decorate([
    Injectable()
], ServicesService);
export { ServicesService };
//# sourceMappingURL=services.service.js.map