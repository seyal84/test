import { useForm } from 'react-hook-form';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

type Form = { title: string; description: string; price: number; imageUrl: string };

export function ListingCreatePage() {
	const { register, handleSubmit } = useForm<Form>({ defaultValues: { price: 0 } });
	const navigate = useNavigate();

	async function onSubmit(values: Form) {
		await api.post('/listings', {
			title: values.title,
			description: values.description,
			price: Number(values.price),
			images: [{ url: values.imageUrl || 'https://picsum.photos/seed/new/800/600' }],
		});
		navigate('/');
	}

	return (
		<div className="container narrow">
			<h2>Create Listing</h2>
			<form onSubmit={handleSubmit(onSubmit)} className="form">
				<label>
					Title
					<input {...register('title', { required: true })} />
				</label>
				<label>
					Description
					<textarea {...register('description', { required: true })} rows={6} />
				</label>
				<label>
					Price
					<input type="number" {...register('price', { valueAsNumber: true, required: true })} />
				</label>
				<label>
					Image URL
					<input {...register('imageUrl')} />
				</label>
				<button type="submit">Create</button>
			</form>
		</div>
	);
}