import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PaperProvider } from 'react-native-paper'
import * as SplashScreen from 'expo-splash-screen'
import * as Font from 'expo-font'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

// Screens
import { HomeScreen } from './src/screens/HomeScreen'
import { SearchScreen } from './src/screens/SearchScreen'
import { FavoritesScreen } from './src/screens/FavoritesScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { PropertyDetailScreen } from './src/screens/PropertyDetailScreen'
import { CameraScreen } from './src/screens/CameraScreen'
import { OffersScreen } from './src/screens/OffersScreen'
import { DocumentsScreen } from './src/screens/DocumentsScreen'
import { LoginScreen } from './src/screens/LoginScreen'
import { RegisterScreen } from './src/screens/RegisterScreen'

// Components
import { LoadingScreen } from './src/components/LoadingScreen'

// Utils
import { theme } from './src/theme'
import { AuthProvider, useAuth } from './src/context/AuthContext'

// Navigation types
export type RootStackParamList = {
  Main: undefined
  PropertyDetail: { propertyId: string }
  Camera: undefined
  Offers: undefined
  Documents: undefined
  Login: undefined
  Register: undefined
}

export type TabParamList = {
  Home: undefined
  Search: undefined
  Favorites: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
    },
  },
})

// Bottom Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home'

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline'
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

// Auth Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

// Main Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <AuthNavigator />
  }

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PropertyDetail" 
        component={PropertyDetailScreen}
        options={{ 
          title: 'Property Details',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ 
          title: 'Take Photo',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Offers" 
        component={OffersScreen}
        options={{ 
          title: 'My Offers',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Documents" 
        component={DocumentsScreen}
        options={{ 
          title: 'Documents',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  )
}

// Main App Component
export default function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync()

        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          'SpaceMono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        })

        // Check for stored authentication
        const token = await AsyncStorage.getItem('authToken')
        console.log('Stored token:', token ? 'exists' : 'not found')

      } catch (e) {
        console.warn(e)
      } finally {
        // Tell the application to render
        setIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = React.useCallback(async () => {
    if (isReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync()
    }
  }, [isReady])

  if (!isReady) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer onReady={onLayoutRootView}>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  )
}