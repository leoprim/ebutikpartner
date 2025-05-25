import { createServerClient } from '@supabase/ssr'
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
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
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  // Fetch all store orders
  const { data, error } = await supabase
    .from('store_orders')
    .select('id, price, order_date')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ orders: data })
}

export async function POST(request: Request) {
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
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Authentication error:', userError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user found')
      return NextResponse.json({ error: 'No user found' }, { status: 401 })
    }

    console.log('Authenticated user:', user.email)

    // Check admin status
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin', { user_id: user.id })

    if (adminError) {
      console.error('Admin check error:', adminError)
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 })
    }
    
    if (!isAdmin) {
      console.error('User is not an admin:', user.id)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    console.log('Admin check passed for user:', user.email)

    // Get request body
    const data = await request.json()
    console.log('Received store order data:', { ...data, requirements: data.requirements?.length })

    // Look up the client user by email using RPC function
    const { data: userId, error: clientError } = await supabase
      .rpc('get_user_by_email', { user_email: data.client_email })

    if (clientError) {
      console.error('Error looking up client:', clientError)
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!userId) {
      console.error('No user ID returned for client email:', data.client_email)
      return NextResponse.json({ error: 'Client not found: No user ID returned' }, { status: 404 })
    }

    console.log('Found client user:', userId)

    // Create store order with client user ID
    const { error: insertError } = await supabase
      .from('store_orders')
      .insert([{
        ...data,
        user_id: userId, // Link to the client user
        created_by: user.id, // Track which admin created the order
      }])

    if (insertError) {
      console.error('Error creating store order:', insertError)
      return NextResponse.json({ error: 'Failed to create store order' }, { status: 500 })
    }

    console.log('Store order created successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in store order creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 