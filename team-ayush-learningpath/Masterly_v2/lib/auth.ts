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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
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
        } catch (error) {
          set({ isLoading: false })
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
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        apiClient.clearToken()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
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
      
        if (!token) {
          console.warn("❌ No token available for auth")
          return
        }
      
        try {
          apiClient.setToken(token)
          const response = await apiClient.getCurrentUser()
          console.log("📨 /auth/me response:", response)
      
          if (response.success) {
            set({
              user: response.data.user,
              token,
              isAuthenticated: true,
            })
            console.log("✅ Zustand state updated:", response.data.user)
          }
        } catch (error) {
          console.error("❌ checkAuth error:", error)
          get().logout()
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
