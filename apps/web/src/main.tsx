import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { PropertiesPage } from './pages/PropertiesPage'
import { PropertyDetailPage } from './pages/PropertyDetailPage'
import { CreatePropertyPage } from './pages/CreatePropertyPage'
import { SearchPage } from './pages/SearchPage'
import { MyListingsPage } from './pages/MyListingsPage'
import { OffersPage } from './pages/OffersPage'
import { OfferDetailPage } from './pages/OfferDetailPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { EscrowPage } from './pages/EscrowPage'
import { EscrowDetailPage } from './pages/EscrowDetailPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AuthGuard } from './components/AuthGuard'
import './styles.css'

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 3
      },
    },
    mutations: {
      retry: 1,
    },
  },
})

// Router configuration
const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  
  // Protected routes
  {
    path: '/',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'properties',
        element: <PropertiesPage />,
      },
      {
        path: 'properties/new',
        element: <CreatePropertyPage />,
      },
      {
        path: 'properties/:id',
        element: <PropertyDetailPage />,
      },
      {
        path: 'properties/:id/edit',
        element: <CreatePropertyPage />, // Reuse for editing
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'my-listings',
        element: <MyListingsPage />,
      },
      {
        path: 'offers',
        element: <OffersPage />,
      },
      {
        path: 'offers/:id',
        element: <OfferDetailPage />,
      },
      {
        path: 'documents',
        element: <DocumentsPage />,
      },
      {
        path: 'escrow',
        element: <EscrowPage />,
      },
      {
        path: 'escrow/:id',
        element: <EscrowDetailPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
])

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Please refresh the page or try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Main App component
const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

// Mount the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)