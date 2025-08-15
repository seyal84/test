import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

export function EscrowPage() {
	const { offerId } = useParams();
	const qc = useQueryClient();
	const { data } = useQuery({ queryKey: ['escrow', offerId], queryFn: async () => (await api.get(`/escrow/offer/${offerId}`)).data, enabled: Boolean(offerId) });
	const [docName, setDocName] = useState('');
	const [docKey, setDocKey] = useState('');
	const addDoc = useMutation({
		mutationFn: async () => (await api.post(`/escrow/${data.id}/documents`, { name: docName, s3Key: docKey })).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: ['escrow', offerId] }),
	});
	const setStatus = useMutation({
		mutationFn: async (status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED') => (await api.put(`/escrow/${data.id}/status`, { status })).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: ['escrow', offerId] }),
	});

	if (!data) return <div className="container narrow"><p>No escrow yet.</p></div>;

	return (
		<div className="container narrow">
			<h2>Escrow for Offer {offerId}</h2>
			<p>Status: {data.status}</p>
			<h3>Documents</h3>
			<ul>
				{(data.documents || []).map((d: any) => <li key={d.id}>{d.name} ({d.s3Key})</li>)}
			</ul>
			<div className="form-inline">
				<input placeholder="Doc name" value={docName} onChange={(e) => setDocName(e.target.value)} />
				<input placeholder="S3 key" value={docKey} onChange={(e) => setDocKey(e.target.value)} />
				<button onClick={() => addDoc.mutate()}>Add</button>
			</div>
			<div className="actions">
				<button onClick={() => setStatus.mutate('IN_PROGRESS')}>Mark In Progress</button>
				<button onClick={() => setStatus.mutate('CLOSED')}>Close</button>
			</div>
		</div>
	);
}