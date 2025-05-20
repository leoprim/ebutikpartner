"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface NicheContextType {
  needsNicheSelection: boolean
  setNeedsNicheSelection: (value: boolean) => void
}

const NicheContext = createContext<NicheContextType | undefined>(undefined)

export function NicheProvider({ children, session }: { children: React.ReactNode, session: any }) {
  const [needsNicheSelection, setNeedsNicheSelection] = useState(false)
  const supabase = createClientComponentClient()
  const userId = session?.user?.id

  useEffect(() => {
    if (!userId) return
    const checkNicheStatus = async (source = 'effect') => {
      try {
        const { data: storeOrder, error } = await supabase
          .from('store_orders')
          .select('niche')
          .eq('user_id', userId)
          .single()
        setNeedsNicheSelection(Boolean(storeOrder && (!storeOrder.niche || storeOrder.niche === '')))
      } catch (error) {
        console.error(`[${source}] Error checking niche status:`, error)
      }
    }
    checkNicheStatus('effect')
    // Set up real-time subscription
    const channel = supabase
      .channel('store_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_orders',
          filter: `user_id=eq.${userId}`
        },
        () => {
          checkNicheStatus('subscription')
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <NicheContext.Provider value={{ needsNicheSelection, setNeedsNicheSelection }}>
      {children}
    </NicheContext.Provider>
  )
}

export function useNiche() {
  const context = useContext(NicheContext)
  if (context === undefined) {
    throw new Error('useNiche must be used within a NicheProvider')
  }
  return context
} 