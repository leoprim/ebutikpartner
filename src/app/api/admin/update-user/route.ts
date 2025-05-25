import { NextRequest, NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, name, email, avatar_url, is_premium } = await req.json()
    // 1. Update Auth user
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email,
      user_metadata: { full_name: name, avatar_url }
    })
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
    // 2. Upsert profiles table
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({ id: userId, is_premium, email })
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
} 