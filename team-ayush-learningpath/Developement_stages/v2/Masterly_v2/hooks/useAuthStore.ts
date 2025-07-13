import { create } from 'zustand'

interface User {
  email: string
  profile: {
    firstName: string
    lastName: string
    avatar?: string
    fullName?: string
    displayName?: string
  }
  // add other fields you care about
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("token")
    set({ user: null, isAuthenticated: false })
  },
}))