'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import apiClient from '@/lib/api'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const { checkAuth, setUser, setToken, setIsAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!token) {
      console.error("❌ No token received from Google Auth")
      router.push('/login?error=no_token')
      return
    }

    console.log("🔐 Google Token received:", token)
    
    // Set token in localStorage and API client
    localStorage.setItem("auth_token", token)
    apiClient.setToken(token)

    // Try to get user data directly first
    apiClient.getCurrentUser()
      .then((response) => {
        console.log("✅ User data received:", response)
        if (response.success && response.data.user) {
          // Set user data directly in store
          setUser(response.data.user)
          setToken(token)
          setIsAuthenticated(true)
          console.log("✅ User authenticated successfully")
          router.push(redirectTo)
        } else {
          throw new Error('Failed to get user data')
        }
      })
      .catch((err) => {
        console.error("❌ Failed to get user data:", err)
        // Fallback to checkAuth
        return checkAuth()
          .then(() => {
            console.log("✅ checkAuth successful")
            router.push(redirectTo)
          })
          .catch((checkAuthErr) => {
            console.error("❌ checkAuth also failed:", checkAuthErr)
            router.push('/login?error=auth_failed')
          })
      })
  }, [token, router, checkAuth, setUser, setToken, setIsAuthenticated])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white">Signing you in with Google...</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  )
}