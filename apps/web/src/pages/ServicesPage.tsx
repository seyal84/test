import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function ServicesPage() {
	const { data } = useQuery({ queryKey: ['services'], queryFn: async () => (await api.get('/services')).data });
	const book = useMutation({ mutationFn: async (id: string) => (await api.post(`/services/${id}/book`, { name: 'Demo User', when: new Date().toISOString() })).data });
	return (
		<div className="container">
			<h2>Professional Services</h2>
			<div className="grid">
				{(data || []).map((p: any) => (
					<div key={p.id} className="card">
						<h3>{p.name}</h3>
						<p>{p.specialty}</p>
						<p>{p.phone}</p>
						<button onClick={() => book.mutate(p.id)}>Book</button>
					</div>
				))}
			</div>
		</div>
	);
}