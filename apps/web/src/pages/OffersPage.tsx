import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useParams } from 'react-router-dom';

export function OffersPage() {
	const { offerId } = useParams();
	const qc = useQueryClient();
	const { data } = useQuery({ queryKey: ['offerHistory', offerId], queryFn: async () => (await api.get(`/offers/${offerId}/history`)).data, enabled: Boolean(offerId) });
	const respond = useMutation({
		mutationFn: async (args: { action: 'accept' | 'decline' | 'counter'; amount?: number }) => (await api.post(`/offers/${offerId}/respond`, undefined, { params: args })).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: ['offerHistory', offerId] }),
	});
	return (
		<div className="container narrow">
			<h2>Offer {offerId}</h2>
			<div className="card">
				<h3>Negotiation History</h3>
				<ul>
					{(data || []).map((n: any) => (
						<li key={n.id}>{new Date(n.createdAt).toLocaleString()} - {n.fromRole}: {n.message}</li>
					))}
				</ul>
			</div>
			<div className="actions">
				<button onClick={() => respond.mutate({ action: 'accept' })}>Accept</button>
				<button onClick={() => respond.mutate({ action: 'decline' })}>Decline</button>
				<button onClick={() => {
					const amount = Number(prompt('Counter amount?') || 0);
					if (amount) respond.mutate({ action: 'counter', amount });
				}}>Counter</button>
			</div>
		</div>
	);
}