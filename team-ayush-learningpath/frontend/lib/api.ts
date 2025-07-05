import type { User } from "@/lib/auth"
import { DashboardData } from "@/lib/types/dashboard"
import type { Course, CourseResponse } from "@/lib/types/courses"

// Types for learning paths
export interface Concept {
  _id: string
  title: string
  description: string
  level: string
  category: string
  complexity: number
  estLearningTimeHours: number
  isFundamental: boolean
  prerequisites?: string[]
  relatedConcepts?: string[]
}

export interface RecommendationResponse {
  success: boolean
  data: {
    concepts: Concept[]
    path: Concept[]
  }
  bestPath: {
    detailedPath: Array<{
      conceptId: string
      title: string
      locked: boolean
    }>
  }
  allPaths: Array<{
    detailedPath: Array<{
      conceptId: string
      title: string
      locked: boolean
    }>
  }>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
  message?: string
  user?: User
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Dynamically get latest token
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  }

  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()

    const config: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "An error occurred")
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
    
    // Handle the new response format
    if (response.message && response.user) {
      return {
        success: true,
        data: {
          user: response.user,
          token: this.getToken() || ''
        }
      }
    }
    
    return response
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
    
    // Handle the new response format
    if (response.message && response.user) {
      return {
        success: true,
        data: {
          user: response.user,
          token: this.getToken() || ''
        }
      }
    }
    
    return response
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" })
  }

  async getCurrentUser(): Promise<{ success: boolean; data: { user: User } }> {
    return this.request<{ success: boolean; data: { user: User } }>("/auth/me")
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    })
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  // User endpoints
  async getUserProfile() {
    return this.request("/users/profile")
  }

  async updateUserProfile(profileData: any) {
    const response = await this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
    
    // Return the updated user data
    if (response.success && response.data?.user) {
      return response.data.user
    }
    
    return response
  }

  async updateUserPreferences(preferences: any) {
    const response = await this.request("/users/preferences", {
      method: "PUT",
      body: JSON.stringify({ preferences }),
    })
    
    // Return the updated user data
    if (response.success && response.data?.user) {
      return response.data.user
    }
    
    return response
  }

  async getUserStats() {
    return this.request("/users/stats")
  }

  async getDashboardData(): Promise<{ success: boolean; data: DashboardData }> {
    const res = await this.getCurrentUser()
    const user = res?.data?.user

    return {
      success: true,
      data: {
        user: {
          name: user.profile.fullName || user.profile.displayName,
          avatar: user.profile.avatar,
          level: user.stats?.level || 1,
          plan: user.subscription?.plan || "free",
        },
        stats: {
          coursesEnrolled: user.stats?.coursesEnrolled || 0,
          conceptsMastered: user.stats?.conceptsMastered || 0,
          currentStreak: user.stats?.currentStreak || 0,
          totalStudyTime: user.stats?.totalStudyTime || 0,
        },
        recentCourses: [],
        achievements: [],
        upcomingTests: [],
        weeklyProgress: {
          conceptsLearned: user.stats?.conceptsMastered || 0,
          quizzesCompleted: user.stats?.quizzesCompleted || 0,
          studyTimeHours: Math.round((user.stats?.totalStudyTime || 0) / 60),
        },
      },
    }
  }

  // Course endpoints

  async getCourses(): Promise<Course[]> {
    const res = await this.request<CourseResponse>("/courses")
    return res.data.courses
  }

  async enrollInCourse(courseId: string) {
    return this.request(`/courses/${courseId}/enroll`, {
      method: "POST",
    })
  }

  async getCourseBySlug(slug: string) {
    return this.request(`/courses/${slug}`)
  }

  async getCourseProgress(courseId: string) {
    return this.request(`/courses/${courseId}/progress`)
  }

  async markTopicComplete(courseId: string, conceptId: string, topicId: string, data: any) {
    return this.request(`/courses/${courseId}/concepts/${conceptId}/topics/${topicId}/complete`, {
      method: "POST",
      body: JSON.stringify({ data }),
    })
  }

  // Learning path endpoints
  async getConcepts(): Promise<Concept[]> {
    return this.request<Concept[]>("/concepts")
  }

  async getUserProgress(userId: string): Promise<any[]> {
    return this.request<any[]>(`/users/progress`)
  }

  async getSavedLearningPath(): Promise<any> {
    return this.request<any>("/learning-path/get")
  }

  async saveLearningPath(pathData: any): Promise<any> {
    return this.request<any>("/learning-path/save", {
      method: "POST",
      body: JSON.stringify(pathData),
    })
  }

  async generateRecommendations(goal: string, conceptId?: string): Promise<RecommendationResponse> {
    const payload: any = { goal }
    if (conceptId) payload.conceptId = conceptId
    
    return this.request<RecommendationResponse>("/recommendation/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async searchConcepts(query: string): Promise<Concept[]> {
    return this.request<Concept[]>(`/concepts/search?q=${encodeURIComponent(query)}`)
  }

  async getAllConcepts(): Promise<Concept[]> {
    return this.request<Concept[]>("/concepts")
  }

  async getRecommendation(goal: string, conceptId?: string): Promise<RecommendationResponse> {
    const payload: any = { goal }
    if (conceptId) payload.conceptId = conceptId
    
    return this.request<RecommendationResponse>("/recommendation/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export const apiService = apiClient
export default apiClient