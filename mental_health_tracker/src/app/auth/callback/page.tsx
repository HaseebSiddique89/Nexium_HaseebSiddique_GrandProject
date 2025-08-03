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
        console.log('Starting auth callback...')
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('Session data:', session)
        console.log('Session error:', error)
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          toast.error('Authentication failed. Please try again.')
          setTimeout(() => router.push('/auth/login'), 3000)
          return
        }
        
        if (!session) {
          console.log('No session found, checking for auth state change...')
          // Wait a bit for the session to be established
          setTimeout(async () => {
            const { data: { session: newSession } } = await supabase.auth.getSession()
            if (newSession) {
              console.log('Session found after delay:', newSession)
              setStatus('success')
              toast.success('Successfully signed in!')
              setTimeout(() => router.push('/dashboard'), 1000)
            } else {
              console.log('Still no session after delay')
              setStatus('error')
              toast.error('Authentication failed. Please try again.')
              setTimeout(() => router.push('/auth/login'), 3000)
            }
          }, 2000)
          return
        }
        
        console.log('Session found, redirecting to dashboard...')
        setStatus('success')
        toast.success('Successfully signed in!')
        setTimeout(() => router.push('/dashboard'), 1000)
        
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