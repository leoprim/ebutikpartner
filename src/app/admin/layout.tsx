import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    redirect('/auth')
  }

  // Check admin status
  const { data: isAdmin, error: adminError } = await supabase
    .rpc('is_admin', { user_id: session.user.id })

  if (adminError || !isAdmin) {
    redirect('/')
  }

  return <>{children}</>
} 