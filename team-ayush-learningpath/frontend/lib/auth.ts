import { create } from "zustand"
import { persist } from "zustand/middleware"
import apiClient from "./api"

export interface User {
  _id: string
  email: string
  profile: {
    firstName: string
    lastName: string
    displayName: string
    fullName?: string
    avatar?: string
    bio?: string
    location?: string
    phone?: string
    website?: string
    socialLinks?: {
      github?: string
      linkedin?: string
      twitter?: string
    }
  }
  subscription: {
    plan: string
    status: string
    endDate?: string
  }
  stats: {
    level: number
    experiencePoints: number
    currentStreak: number
    totalStudyTime: number
    coursesCompleted: number
    coursesEnrolled: number
    conceptsMastered: number
    longestStreak: number
    quizzesCompleted: number
  }
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      courseReminders: boolean
      achievements: boolean
      weeklyReports: boolean
    }
    learning: {
      difficultyPreference: string
      dailyGoal: number
      preferredLanguages: string[]
    }
    privacy: {
      profileVisibility: string
      showProgress: boolean
      showAchievements: boolean
    }
  }
  role: string
  emailVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  checkAuth: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true, // Start with loading true
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const response = await apiClient.login({ email, password })

          if (response.success) {
            const { user, token } = response.data
            apiClient.setToken(token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch (error: any) {
          set({ isLoading: false })
          // Handle Google user case
          if (error.message && error.message.includes('Google')) {
            throw new Error('This account was created with Google. Please use "Continue with Google" to sign in.')
          }
          throw error
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true })
          const response = await apiClient.register(userData)

          if (response.success) {
            const { user, token } = response.data
            apiClient.setToken(token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch (error: any) {
          set({ isLoading: false })
          // Handle account linking case
          if (error.message && error.message.includes('linked')) {
            // Don't throw error for account linking, just show success message
            return
          }
          throw error
        }
      },

      logout: () => {
        apiClient.clearToken()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      checkAuth: async () => {
        let token = get().token
      
        if (!token && typeof window !== 'undefined') {
          token = localStorage.getItem('auth_token')
          console.log("📦 token from localStorage:", token)
        }
      
        try {
          // If we have a token, use it
          if (token) {
            apiClient.setToken(token)
            console.log('🔑 Using token for /auth/me:', token)
            const response = await apiClient.getCurrentUser()
            console.log("📨 /auth/me response:", response)
      
            if (response.success) {
              set({
                user: response.data.user,
                token,
                isAuthenticated: true,
                isLoading: false,
              })
              console.log("✅ Zustand state updated:", response.data.user)
              return
            }
          }
          
          // If no token or token failed, try cookie-based auth
          console.log("🍪 Trying cookie-based authentication...")
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data?.user) {
              console.log("✅ Cookie-based auth successful")
              set({
                user: data.data.user,
                token: null, // No token needed for cookie-based auth
                isAuthenticated: true,
                isLoading: false,
              })
              // Remove any stale token
              if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token')
              }
              return
            }
          }
          
          console.warn("❌ No valid authentication found")
          set({ isLoading: false })
          // Always clear token and redirect if no valid auth
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/login')) {
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
            }
          }
          
        } catch (error: any) {
          console.error("❌ checkAuth error:", error)
          // Always clear auth if it's a definitive auth error
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/login')) {
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
            }
          }
        }
      },

      refreshUser: async () => {
        try {
          const response = await apiClient.getCurrentUser()
          if (response.success) {
            set({ user: response.data.user })
          }
        } catch (error) {
          console.error("Failed to refresh user:", error)
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },

      setToken: (token: string | null) => {
        set({ token })
      },

      setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
