import axios, { AxiosResponse, AxiosError } from 'axios'
import { toast } from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  role: 'BUYER' | 'SELLER' | 'AGENT' | 'SERVICE_PROVIDER' | 'ADMIN'
  avatar?: string
  bio?: string
  licenseNumber?: string
  brokerage?: string
  preferences?: any
  createdAt: string
  updatedAt: string
}

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  propertyType: 'SINGLE_FAMILY' | 'TOWNHOUSE' | 'CONDO' | 'MULTI_FAMILY' | 'LAND' | 'COMMERCIAL'
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'OFF_MARKET' | 'DRAFT'
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  lotSize?: number
  yearBuilt?: number
  stories?: number
  garage?: number
  pool: boolean
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number
  neighborhood?: string
  schoolDistrict?: string
  images: string[]
  virtualTourUrl?: string
  floorPlanUrl?: string
  videos?: string[]
  features: string[]
  appliances: string[]
  utilities?: any
  hoa?: any
  mlsNumber?: string
  tags: string[]
  aiExtractedData?: any
  marketAnalysis?: any
  sellerId: string
  seller: User
  agentId?: string
  agent?: User
  createdAt: string
  updatedAt: string
}

export interface Offer {
  id: string
  listingId: string
  listing: Listing
  buyerId: string
  buyer: User
  amount: number
  status: 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'WITHDRAWN'
  earnestMoney?: number
  downPayment?: number
  loanAmount?: number
  closingDate?: string
  inspectionPeriod?: number
  contingencies?: any
  terms?: string
  expiration?: string
  aiRiskAssessment?: any
  aiRecommendations?: any
  marketComparison?: any
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  name: string
  originalName: string
  s3Key: string
  s3Bucket: string
  mimeType: string
  size: number
  type: 'CONTRACT' | 'INSPECTION_REPORT' | 'DISCLOSURE' | 'FINANCIAL' | 'PROPERTY_PHOTOS' | 'FLOOR_PLANS' | 'MLS_SHEET' | 'APPRAISAL' | 'INSURANCE' | 'OTHER'
  processingStatus: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'REJECTED'
  extractedData?: any
  aiSummary?: string
  aiCategory?: string
  aiConfidenceScore?: number
  processingError?: string
  ocrText?: string
  uploadedById?: string
  uploadedBy?: User
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  readAt?: string
  createdAt: string
}

// Auth management
let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('authToken', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('authToken')
  }
}

// Initialize auth token from localStorage
const storedToken = localStorage.getItem('authToken')
if (storedToken) {
  setAuthToken(storedToken)
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setAuthToken(null)
      window.location.href = '/login'
      toast.error('Your session has expired. Please log in again.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      toast.error(error.response.data.message as string)
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { email: string; password: string; fullName: string; role: string }) =>
    api.post('/auth/register', userData),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
  
  logout: () =>
    api.post('/auth/logout'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
}

// Users API
export const usersApi = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (data: Partial<User>) =>
    api.patch('/users/profile', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  getUsers: (params?: { role?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/users', { params }),
}

// Listings API
export const listingsApi = {
  getListings: (params?: {
    search?: string
    propertyType?: string
    minPrice?: number
    maxPrice?: number
    bedrooms?: number
    bathrooms?: number
    city?: string
    state?: string
    zipCode?: string
    features?: string[]
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => api.get('/listings', { params }),
  
  getListing: (id: string) =>
    api.get(`/listings/${id}`),
  
  createListing: (data: Partial<Listing>) =>
    api.post('/listings', data),
  
  updateListing: (id: string, data: Partial<Listing>) =>
    api.patch(`/listings/${id}`, data),
  
  deleteListing: (id: string) =>
    api.delete(`/listings/${id}`),
  
  uploadImages: (listingId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    return api.post(`/listings/${listingId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  searchWithAI: (query: string, filters?: any) =>
    api.post('/listings/search/ai', { query, filters }),
  
  getFavorites: () =>
    api.get('/listings/favorites'),
  
  toggleFavorite: (listingId: string) =>
    api.post(`/listings/${listingId}/favorite`),
  
  getMyListings: () =>
    api.get('/listings/my-listings'),
}

// Offers API
export const offersApi = {
  getOffers: (params?: { listingId?: string; buyerId?: string; status?: string }) =>
    api.get('/offers', { params }),
  
  getOffer: (id: string) =>
    api.get(`/offers/${id}`),
  
  createOffer: (data: Partial<Offer>) =>
    api.post('/offers', data),
  
  updateOffer: (id: string, data: Partial<Offer>) =>
    api.patch(`/offers/${id}`, data),
  
  acceptOffer: (id: string) =>
    api.post(`/offers/${id}/accept`),
  
  declineOffer: (id: string, reason?: string) =>
    api.post(`/offers/${id}/decline`, { reason }),
  
  counterOffer: (id: string, data: { amount: number; terms?: string; expiration?: string }) =>
    api.post(`/offers/${id}/counter`, data),
  
  withdrawOffer: (id: string) =>
    api.post(`/offers/${id}/withdraw`),
}

// Documents API
export const documentsApi = {
  uploadDocument: (file: File, options?: {
    listingId?: string
    offerId?: string
    escrowId?: string
    milestoneId?: string
    type?: string
    enableAI?: boolean
    notifyUsers?: boolean
  }) => {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value))
        }
      })
    }
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  uploadMultipleDocuments: (files: File[], options?: {
    listingId?: string
    offerId?: string
    escrowId?: string
    milestoneId?: string
    enableAI?: boolean
    notifyUsers?: boolean
  }) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value))
        }
      })
    }
    return api.post('/documents/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  getDocuments: (params?: {
    listingId?: string
    offerId?: string
    escrowId?: string
    milestoneId?: string
    type?: string
  }) => api.get('/documents', { params }),
  
  getDocument: (id: string) =>
    api.get(`/documents/${id}`),
  
  deleteDocument: (id: string) =>
    api.delete(`/documents/${id}`),
  
  generateThumbnail: (id: string) =>
    api.post(`/documents/${id}/thumbnail`),
}

// Escrow API
export const escrowApi = {
  getEscrows: () =>
    api.get('/escrow'),
  
  getEscrow: (id: string) =>
    api.get(`/escrow/${id}`),
  
  updateEscrow: (id: string, data: any) =>
    api.patch(`/escrow/${id}`, data),
  
  getMilestones: (escrowId: string) =>
    api.get(`/escrow/${escrowId}/milestones`),
  
  updateMilestone: (escrowId: string, milestoneId: string, data: any) =>
    api.patch(`/escrow/${escrowId}/milestones/${milestoneId}`, data),
  
  getPayments: (escrowId: string) =>
    api.get(`/escrow/${escrowId}/payments`),
  
  createPayment: (escrowId: string, data: any) =>
    api.post(`/escrow/${escrowId}/payments`, data),
}

// Notifications API
export const notificationsApi = {
  getNotifications: (params?: { limit?: number; offset?: number }) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
}

// Storage API
export const storageApi = {
  getPresignedUrl: (key: string, contentType: string) =>
    api.post('/storage/presign', { key, contentType }),
}

// Market Data API
export const marketApi = {
  getMarketData: (zipCode: string) =>
    api.get(`/market/data/${zipCode}`),
  
  getComparables: (listingId: string) =>
    api.get(`/market/comparables/${listingId}`),
  
  getPriceHistory: (address: string) =>
    api.get(`/market/price-history`, { params: { address } }),
}

// Export utility function for file downloads
export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await api.get(url, { responseType: 'blob' })
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    toast.error('Failed to download file')
    throw error
  }
}