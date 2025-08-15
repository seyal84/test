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

				// Additional mock endpoints to allow the demo to run without the backend
				const services = [
					{ id: '1', name: 'Acme Home Inspectors', specialty: 'Inspection', phone: '555-1000' },
					{ id: '2', name: 'Elite Appraisal Co.', specialty: 'Appraisal', phone: '555-2000' },
					{ id: '3', name: 'TitleSecure LLC', specialty: 'Title', phone: '555-3000' },
				];
				server.middlewares.use('/api/services', (req, res) => {
					res.setHeader('Content-Type', 'application/json');
					const url = new URL(req.url || '', 'http://localhost');
					if (req.method === 'GET' && url.pathname === '/api/services') {
						res.end(JSON.stringify(services));
						return;
					}
					if (req.method === 'POST' && /^\/api\/services\/.+\/book$/.test(url.pathname)) {
						const id = url.pathname.split('/')[3];
						res.end(JSON.stringify({ ok: true, id }));
						return;
					}
					res.statusCode = 404;
					res.end(JSON.stringify({ error: 'Not Found' }));
				});

				const offerHistoryById: Record<string, any[]> = {};
				server.middlewares.use('/api/offers', (req, res) => {
					res.setHeader('Content-Type', 'application/json');
					const url = new URL(req.url || '', 'http://localhost');
					const m = url.pathname.match(/^\/api\/offers\/([^/]+)\/(history|respond)$/);
					if (!m) {
						res.statusCode = 404;
						res.end(JSON.stringify({ error: 'Not Found' }));
						return;
					}
					const offerId = m[1];
					const action = m[2];
					offerHistoryById[offerId] ||= [
						{ id: 'h1', createdAt: new Date().toISOString(), fromRole: 'BUYER', message: 'Initial offer submitted' },
					];
					if (req.method === 'GET' && action === 'history') {
						res.end(JSON.stringify(offerHistoryById[offerId]));
						return;
					}
					if (req.method === 'POST' && action === 'respond') {
						let body = '';
						req.on('data', (chunk) => (body += chunk));
						req.on('end', () => {
							try {
								const url2 = new URL(req.url || '', 'http://localhost');
								const params = Object.fromEntries(url2.searchParams.entries());
								offerHistoryById[offerId].push({ id: `h${offerHistoryById[offerId].length + 1}`, createdAt: new Date().toISOString(), fromRole: 'SELLER', message: `Response: ${params.action}${params.amount ? ' $' + params.amount : ''}` });
								res.end(JSON.stringify({ ok: true }));
							} catch {
								res.statusCode = 400;
								res.end(JSON.stringify({ error: 'Invalid request' }));
							}
						});
						return;
					}
					res.statusCode = 405;
					res.end(JSON.stringify({ error: 'Method Not Allowed' }));
				});

				const escrowsByOfferId: Record<string, any> = {};
				server.middlewares.use('/api/escrow', (req, res) => {
					res.setHeader('Content-Type', 'application/json');
					const url = new URL(req.url || '', 'http://localhost');
					if (req.method === 'GET') {
						const m = url.pathname.match(/^\/api\/escrow\/offer\/([^/]+)$/);
						if (m) {
							const offerId = m[1];
							escrowsByOfferId[offerId] ||= { id: `e-${offerId}`, offerId, status: 'OPEN', documents: [] };
							res.end(JSON.stringify(escrowsByOfferId[offerId]));
							return;
						}
					}
					if (req.method === 'POST') {
						const m = url.pathname.match(/^\/api\/escrow\/([^/]+)\/documents$/);
						if (m) {
							const escrowId = m[1];
							let body = '';
							req.on('data', (chunk) => (body += chunk));
							req.on('end', () => {
								try {
									const dto = JSON.parse(body || '{}');
									const offerId = escrowId.split('e-')[1] || 'unknown';
									const esc = Object.values(escrowsByOfferId).find((e) => e.id === escrowId) || { id: escrowId, offerId, status: 'OPEN', documents: [] };
									esc.documents.push({ id: `d${esc.documents.length + 1}`, name: dto.name, s3Key: dto.s3Key });
									escrowsByOfferId[offerId] = esc;
									res.statusCode = 201;
									res.end(JSON.stringify(esc));
								} catch {
									res.statusCode = 400;
									res.end(JSON.stringify({ error: 'Invalid JSON' }));
								}
							});
							return;
						}
					}
					if (req.method === 'PUT') {
						const m = url.pathname.match(/^\/api\/escrow\/([^/]+)\/status$/);
						if (m) {
							const escrowId = m[1];
							let body = '';
							req.on('data', (chunk) => (body += chunk));
							req.on('end', () => {
								try {
									const dto = JSON.parse(body || '{}');
									const offerId = escrowId.split('e-')[1] || 'unknown';
									const esc = Object.values(escrowsByOfferId).find((e) => e.id === escrowId) || { id: escrowId, offerId, status: 'OPEN', documents: [] };
									esc.status = dto.status || esc.status;
									escrowsByOfferId[offerId] = esc;
									res.end(JSON.stringify(esc));
								} catch {
									res.statusCode = 400;
									res.end(JSON.stringify({ error: 'Invalid JSON' }));
								}
							});
							return;
						}
					}
					res.statusCode = 404;
					res.end(JSON.stringify({ error: 'Not Found' }));
				});
			},
		},
	],
	server: { host: '0.0.0.0', port: Number(process.env.WEB_PORT) || 5173, allowedHosts: true, proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') } } },
});