import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { usersApi, setAuthToken } from '../lib/api'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation()
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if user has a stored token
  const storedToken = localStorage.getItem('authToken')

  // Query to verify the token and get user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => usersApi.getProfile().then(res => res.data),
    enabled: !!storedToken && !isInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (!storedToken) {
      setIsInitialized(true)
      return
    }

    if (user) {
      setIsInitialized(true)
    } else if (error) {
      // Token is invalid, remove it
      setAuthToken(null)
      setIsInitialized(true)
    }
  }, [user, error, storedToken])

  // Show loading spinner while checking authentication
  if (!isInitialized || (storedToken && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no token or user, redirect to login
  if (!storedToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated, render children
  return <>{children}</>
}

// Hook to get current user data
export const useAuth = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => usersApi.getProfile().then(res => res.data),
    enabled: !!localStorage.getItem('authToken'),
    staleTime: 5 * 60 * 1000,
  })

  const logout = () => {
    setAuthToken(null)
    window.location.href = '/login'
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  }
}