import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')
  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('Auth error:', userError)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('video_progress')
    .select('progress, timestamp')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Database error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ progress: data?.progress ?? 0, timestamp: data?.timestamp ?? 0 })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const body = await request.json()
  const { videoId, progress, timestamp } = body
  if (!videoId || typeof progress !== 'number' || typeof timestamp !== 'number') {
    return NextResponse.json({ error: 'Missing videoId, progress, or timestamp' }, { status: 400 })
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    console.error('Auth error:', userError)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Upsert progress
  const { error } = await supabase
    .from('video_progress')
    .upsert({
      user_id: user.id,
      video_id: videoId,
      progress,
      timestamp,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,video_id' })

  if (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
} 