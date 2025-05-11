import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('useAdmin - User:', user?.email)
        
        if (userError) {
          console.error('useAdmin - Error getting user:', userError)
          setIsAdmin(false)
          return
        }
        
        if (!user) {
          console.log('useAdmin - No user found')
          setIsAdmin(false)
          return
        }

        const { data, error } = await supabase
          .rpc('is_admin', { user_id: user.id })

        console.log('useAdmin - Admin check result:', { data, error })

        if (error) {
          console.error('useAdmin - Error checking admin status:', error)
          throw error
        }
        
        setIsAdmin(data)
      } catch (error) {
        console.error('useAdmin - Error in checkAdminStatus:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [supabase])

  return { isAdmin, isLoading }
} 