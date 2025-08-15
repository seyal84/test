import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ServicesService } from './services.service.js';

@Controller('services')
export class ServicesController {
	constructor(private readonly servicesService: ServicesService) {}

	@Get()
	list() {
		return this.servicesService.list();
	}

	@Post(':id/book')
	book(@Param('id') id: string, @Body() body: { name: string; when: string; notes?: string }) {
		return this.servicesService.book(id, body);
	}
}