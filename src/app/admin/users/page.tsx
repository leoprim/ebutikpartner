import supabaseAdmin from "@/lib/supabase/admin"
import UsersTable from "./UsersTable"

export default async function AdminUsersPage({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  // Fetch users from Supabase Auth admin API using service role
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  const users = data?.users || []

  // Fetch all profiles (id, is_premium)
  const { data: profilesData } = await supabaseAdmin.from('profiles').select('id, is_premium')
  const profiles = profilesData || []

  // Pass search query to client if needed
  const search = typeof searchParams?.q === 'string' ? searchParams.q.toLowerCase() : ""

  return <UsersTable users={users} profiles={profiles} initialSearch={search} />
} 