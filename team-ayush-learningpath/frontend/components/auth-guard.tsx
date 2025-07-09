"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, checkAuth, token } = useAuthStore()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [hasCheckedCookies, setHasCheckedCookies] = useState(false)

  useEffect(() => {
    const validateAuth = async () => {
      try {
        // First, check if we have a token in localStorage
        let currentToken = token
        if (!currentToken && typeof window !== 'undefined') {
          currentToken = localStorage.getItem('auth_token')
        }

        // If we have a token but not authenticated, try to validate it
        if (currentToken && !isAuthenticated && !isLoading) {
          console.log("🔄 Validating existing token...")
          await checkAuth()
          setHasCheckedCookies(true)
          return
        }

        // If we don't have a token, check for cookies (JWT might be in cookies)
        if (!currentToken && !isAuthenticated && !isLoading && !hasCheckedCookies) {
          console.log("🍪 Checking for JWT in cookies...")
          try {
            // Try to get user data without a token (cookies will be sent automatically)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data?.user) {
                console.log("✅ Found valid JWT in cookies")
                // Update the auth store with the user data
                await checkAuth()
                setHasCheckedCookies(true)
                return
              }
            }
          } catch (cookieError) {
            console.log("❌ No valid JWT in cookies")
          }
          setHasCheckedCookies(true)
        }
        
        // If still not authenticated after all checks, redirect to login
        if (!isAuthenticated && !isLoading && hasCheckedCookies) {
          console.log("❌ Not authenticated after all checks, redirecting to login")
          if (typeof window !== 'undefined') {
            router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
          }
        }
      } catch (error) {
        console.error("❌ Auth validation failed:", error)
        // Only redirect if we've done all our checks
        if (hasCheckedCookies && typeof window !== 'undefined') {
          router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
        }
      } finally {
        setIsChecking(false)
      }
    }

    // Only check if we're not already loading
    if (!isLoading) {
      validateAuth()
    }
  }, [isAuthenticated, isLoading, checkAuth, token, router, hasCheckedCookies])

  // Show loading while checking auth
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Loading...</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Validating your session</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">Authentication Required</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Please log in to access this page</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 