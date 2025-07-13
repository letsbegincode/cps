'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import apiClient from '@/lib/api'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    if (!token) return

    console.log("🔐 Google Token:", token)
    localStorage.setItem("auth_token", token)
    apiClient.setToken(token)

    checkAuth()
      .then(() => {
        console.log("✅ Zustand state after checkAuth:", useAuthStore.getState())
        router.push('/dashboard')
      })
      .catch((err) => {
        console.error("❌ checkAuth failed", err)
        router.push('/login?error=auth_failed')
      })
  }, [token])

  return <div>Signing you in with Google...</div>
}