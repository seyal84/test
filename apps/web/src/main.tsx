import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ListingsPage } from './pages/ListingsPage';
import { ListingCreatePage } from './pages/ListingCreatePage';
import { OffersPage } from './pages/OffersPage';
import { EscrowPage } from './pages/EscrowPage';
import { ServicesPage } from './pages/ServicesPage';
import './styles.css';

const queryClient = new QueryClient();

const router = createBrowserRouter([
	{ path: '/', element: <ListingsPage /> },
	{ path: '/sell/new', element: <ListingCreatePage /> },
	{ path: '/offers/:offerId', element: <OffersPage /> },
	{ path: '/escrow/:offerId', element: <EscrowPage /> },
	{ path: '/services', element: <ServicesPage /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>
);