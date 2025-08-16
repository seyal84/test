import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Search, 
  FileText, 
  MessageSquare, 
  Settings, 
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Building,
  PlusCircle
} from 'lucide-react'
import { cn } from '../lib/utils'

interface LayoutProps {
  children?: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'My Listings', href: '/my-listings', icon: FileText },
    { name: 'Offers', href: '/offers', icon: MessageSquare },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const currentUser = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Real Estate Agent',
    avatar: '/api/placeholder/32/32'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-4">
                <h1 className="text-xl font-bold text-blue-600">HomeFlow</h1>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="mt-8 px-4">
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          location.pathname === item.href
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
          <div className="flex h-16 items-center px-6">
            <h1 className="text-xl font-bold text-blue-600">HomeFlow</h1>
          </div>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      location.pathname === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src={currentUser.avatar}
                alt={currentUser.name}
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-400 hover:text-gray-600 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="ml-4 text-lg font-semibold text-gray-900 lg:ml-0">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick actions */}
              <Link
                to="/properties/new"
                className="hidden sm:flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Property
              </Link>

              {/* Notifications */}
              <button className="relative text-gray-400 hover:text-gray-600">
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center text-gray-400 hover:text-gray-600">
                  <User className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}