'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface StoreOrderData {
  store_name: string
  client_name: string
  client_email: string
  price: number
  niche: string
  description: string
  requirements: string[]
  status: string
  progress: number
  user_id: string
  created_by?: string
}

export async function createStoreOrder(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      throw new Error('Authentication failed')
    }

    console.log('Authenticated user:', user.email)

    // Check if this is an admin creating an order for a client
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin', { user_id: user.id })

    if (adminError) {
      console.error('Admin check error:', adminError)
      throw new Error('Failed to verify admin status')
    }

    const data: StoreOrderData = {
      store_name: formData.get('store_name') as string,
      client_name: formData.get('client_name') as string,
      client_email: formData.get('client_email') as string,
      price: parseFloat(formData.get('price') as string),
      niche: formData.get('niche') as string,
      description: formData.get('description') as string,
      requirements: (formData.get('requirements') as string).split('\n').filter(Boolean),
      status: 'pending',
      progress: 0,
      user_id: user.id, // Default to current user
    }

    console.log('Received store order data:', { ...data, requirements: data.requirements?.length })

    if (isAdmin) {
      // If admin, look up the client user by email using RPC function
      console.log('Looking up client user by email:', data.client_email)
      const { data: userId, error: clientError } = await supabase
        .rpc('get_user_by_email', { user_email: data.client_email })

      if (clientError) {
        console.error('Error looking up client:', clientError)
        throw new Error(`Client not found: ${clientError.message}`)
      }

      if (!userId) {
        console.error('No user ID returned for client email:', data.client_email)
        throw new Error('Client not found: No user ID returned')
      }

      data.user_id = userId
      data.created_by = user.id
      console.log('Admin creating order for client:', { client_id: data.user_id, admin_id: user.id })
    } else {
      console.log('User creating their own order:', { user_id: data.user_id, email: user.email })
    }

    // Use regular client for all users
    const { error: insertError } = await supabase
      .from('store_orders')
      .insert([data])

    if (insertError) {
      console.error('Error creating store order:', insertError)
      throw new Error('Failed to create store order')
    }

    console.log('Store order created successfully')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in createStoreOrder:', error)
    throw error
  }
} 