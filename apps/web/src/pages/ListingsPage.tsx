import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ListingsPage() {
	const [q, setQ] = useState('');
	const { data, isLoading } = useQuery({
		queryKey: ['listings', q],
		queryFn: async () => (await api.get('/listings', { params: { q } })).data,
	});
	return (
		<div className="container">
			<header>
				<h1>HomeFlow</h1>
				<nav>
					<Link to="/sell/new">Create Listing</Link>
					<Link to="/services">Services</Link>
				</nav>
			</header>
			<div className="search">
				<input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
			</div>
			{isLoading ? (
				<p>Loading...</p>
			) : (
				<div className="grid">
					{(data || []).map((l: any) => (
						<div key={l.id} className="card">
							<img src={(l.images?.[0]?.url) || 'https://picsum.photos/seed/fallback/600/400'} alt="" />
							<h3>{l.title}</h3>
							<p>${l.price.toLocaleString()}</p>
							<div className="tags">{l.tags?.map((t: string) => <span key={t}>{t}</span>)}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}