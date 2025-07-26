'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          toast.error('Authentication failed. Please try again.')
          setTimeout(() => router.push('/auth/login'), 3000)
        } else {
          setStatus('success')
          toast.success('Successfully signed in!')
          setTimeout(() => router.push('/dashboard'), 1000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        toast.error('Authentication failed. Please try again.')
        setTimeout(() => router.push('/auth/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900">Signing you in...</h2>
            <p className="text-gray-600">Please wait while we complete your authentication.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Successfully signed in!</h2>
            <p className="text-gray-600">Redirecting you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Authentication failed</h2>
            <p className="text-gray-600">Please try signing in again.</p>
          </>
        )}
      </div>
    </div>
  )
} 