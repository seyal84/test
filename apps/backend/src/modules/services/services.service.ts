import { Injectable } from '@nestjs/common';

@Injectable()
export class ServicesService {
	private providers = [
		{ id: '1', name: 'Acme Home Inspectors', specialty: 'Inspection', phone: '555-1000' },
		{ id: '2', name: 'Sunrise Title', specialty: 'Title & Escrow', phone: '555-2000' },
		{ id: '3', name: 'CleanCo', specialty: 'Cleaning', phone: '555-3000' },
	];

	list() {
		return this.providers;
	}

	book(providerId: string, details: { name: string; when: string; notes?: string }) {
		return { providerId, confirmationId: `bk_${Date.now()}`, details };
	}
}