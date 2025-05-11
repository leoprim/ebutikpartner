import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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

    // Look up the client user by email
    const { data: clientUser, error: clientError } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.client_email)
      .single()

    if (clientError) {
      console.error('Error looking up client:', clientError)
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    console.log('Found client user:', clientUser.id)

    // Create store order with client user ID
    const { error: insertError } = await supabase
      .from('store_orders')
      .insert([{
        ...data,
        user_id: clientUser.id, // Link to the client user
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