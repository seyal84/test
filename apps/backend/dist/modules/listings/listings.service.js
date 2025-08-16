var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import axios from 'axios';
let ListingsService = class ListingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(params) {
        const where = {};
        if (params?.q)
            where.OR = [{ title: { contains: params.q, mode: 'insensitive' } }, { description: { contains: params.q, mode: 'insensitive' } }];
        if (params?.min)
            where.price = { ...(where.price || {}), gte: params.min };
        if (params?.max)
            where.price = { ...(where.price || {}), lte: params.max };
        return this.prisma.listing.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async create(sellerId, dto) {
        const tags = dto.tags?.length ? dto.tags : await this.enhanceTags(dto.description);
        return this.prisma.listing.create({
            data: { ...dto, tags, sellerId },
        });
    }
    async update(id, dto) {
        let tags = dto.tags;
        if ((!tags || tags.length === 0) && dto.description)
            tags = await this.enhanceTags(dto.description);
        return this.prisma.listing.update({ where: { id }, data: { ...dto, ...(tags ? { tags } : {}) } });
    }
    remove(id) {
        return this.prisma.listing.delete({ where: { id } });
    }
    async enhanceTags(text) {
        const token = process.env.HF_API_TOKEN;
        try {
            if (!token)
                return this.basicTagging(text);
            const resp = await axios.post(`https://api-inference.huggingface.co/models/${process.env.HF_MODEL || 'sshleifer/tiny-distilroberta-base'}',
				{ inputs: text },
				{ headers: { Authorization: `, Bearer, $, { token } ` } }
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
});
        }
        finally { }
    }
};
ListingsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ListingsService);
export { ListingsService };
//# sourceMappingURL=listings.service.js.map