import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import axios from 'axios';

@Injectable()
export class ListingsService {
	constructor(private readonly prisma: PrismaService) {}

	async list(params?: { q?: string; min?: number; max?: number }) {
		const where: any = {};
		if (params?.q) where.OR = [{ title: { contains: params.q, mode: 'insensitive' } }, { description: { contains: params.q, mode: 'insensitive' } }];
		if (params?.min) where.price = { ...(where.price || {}), gte: params.min };
		if (params?.max) where.price = { ...(where.price || {}), lte: params.max };
		return this.prisma.listing.findMany({ where, orderBy: { createdAt: 'desc' } });
	}

	async create(sellerId: string, dto: CreateListingDto) {
		const tags = dto.tags?.length ? dto.tags : await this.enhanceTags(dto.description);
		return this.prisma.listing.create({
			data: { ...dto, tags, sellerId },
		});
	}

	async update(id: string, dto: Partial<CreateListingDto>) {
		let tags = dto.tags;
		if ((!tags || tags.length === 0) && dto.description) tags = await this.enhanceTags(dto.description);
		return this.prisma.listing.update({ where: { id }, data: { ...dto, ...(tags ? { tags } : {}) } });
	}

	remove(id: string) {
		return this.prisma.listing.delete({ where: { id } });
	}

	private async enhanceTags(text: string): Promise<string[]> {
		const token = process.env.HF_API_TOKEN;
		try {
			if (!token) return this.basicTagging(text);
			const resp = await axios.post(
				`https://api-inference.huggingface.co/models/${process.env.HF_MODEL || 'sshleifer/tiny-distilroberta-base'}',
				{ inputs: text },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			const labels = Array.isArray(resp.data) ? resp.data : [];
			const flat = labels.flat(2) as any[];
			return flat.map((l) => (typeof l.label === 'string' ? l.label.toLowerCase() : '')).filter(Boolean).slice(0, 5);
		} catch {
			return this.basicTagging(text);
		}
	}

	private basicTagging(text: string): string[] {
		const kw = ['cozy', 'spacious', 'modern', 'updated', 'downtown', 'garden', 'garage', 'pool'];
		const lower = text.toLowerCase();
		return kw.filter((k) => lower.includes(k)).slice(0, 5);
	}
}