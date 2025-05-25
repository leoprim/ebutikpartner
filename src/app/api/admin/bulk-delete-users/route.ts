import { NextRequest, NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { userIds } = await req.json()
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 })
    }
    // 1. Delete from Auth (loop)
    let authError = null
    for (const userId of userIds) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) {
        authError = error
        break
      }
    }
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
    // 2. Delete from profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().in('id', userIds)
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
} 