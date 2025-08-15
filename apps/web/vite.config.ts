import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [
		react(),
		{
			name: 'mock-api',
			configureServer(server) {
				const listings = [
					{
						id: 'l1',
						title: 'Charming Bungalow',
						description: '2 bed, 1 bath with updated kitchen and a sunny backyard.',
						price: 450000,
						images: [{ url: 'https://picsum.photos/seed/house1/800/600' }, { url: 'https://picsum.photos/seed/house2/800/600' }],
						tags: ['bungalow', 'sunny', 'updated'],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
					{
						id: 'l2',
						title: 'Modern Downtown Condo',
						description: '1 bed, 1 bath condo with skyline views and gym access.',
						price: 620000,
						images: [{ url: 'https://picsum.photos/seed/condo/800/600' }],
						tags: ['modern', 'downtown', 'views'],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				];

				server.middlewares.use('/api/listings', (req, res) => {
					res.setHeader('Content-Type', 'application/json');
					if (req.method === 'GET') {
						const url = new URL(req.url || '', 'http://localhost');
						const q = url.searchParams.get('q')?.toLowerCase() || '';
						const min = Number(url.searchParams.get('min') || '') || undefined;
						const max = Number(url.searchParams.get('max') || '') || undefined;
						const filtered = listings.filter((l) => {
							const matchesQ = q ? l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) : true;
							const matchesMin = typeof min === 'number' ? l.price >= min : true;
							const matchesMax = typeof max === 'number' ? l.price <= max : true;
							return matchesQ && matchesMin && matchesMax;
						});
						res.end(JSON.stringify(filtered));
						return;
					}
					if (req.method === 'POST') {
						let body = '';
						req.on('data', (chunk) => (body += chunk));
						req.on('end', () => {
							try {
								const dto = JSON.parse(body || '{}');
								const newItem = {
									id: `l${listings.length + 1}`,
									createdAt: new Date().toISOString(),
									updatedAt: new Date().toISOString(),
									images: dto.images || [],
									tags: dto.tags || [],
									price: Number(dto.price) || 0,
									title: dto.title || 'Untitled',
									description: dto.description || '',
									sellerId: 'seller-placeholder',
								};
								listings.unshift(newItem);
								res.statusCode = 201;
								res.end(JSON.stringify(newItem));
							} catch {
								res.statusCode = 400;
								res.end(JSON.stringify({ error: 'Invalid JSON' }));
							}
						});
						return;
					}
					res.statusCode = 405;
					res.end(JSON.stringify({ error: 'Method Not Allowed' }));
				});
			},
		},
	],
	server: { host: '0.0.0.0', port: Number(process.env.WEB_PORT) || 5173, allowedHosts: true },
});