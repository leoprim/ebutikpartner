import supabaseAdmin from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
  // Fetch all users from Supabase Auth
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
  // Fetch all profiles (for is_premium, etc)
  const { data: profilesData, error: profilesError } = await supabaseAdmin.from('profiles').select('id, is_premium, email')

  if (usersError || profilesError) {
    console.error("Users error:", usersError);
    console.error("Profiles error:", profilesError);
    return NextResponse.json({ error: usersError?.message || profilesError?.message }, { status: 500 })
  }

  return NextResponse.json({
    users: usersData?.users || [],
    profiles: profilesData || [],
  })
} 