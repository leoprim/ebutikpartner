import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/topbar"
import { SidebarProvider } from "@/components/ui/sidebar"

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )

  // Check authentication using getUser() instead of getSession()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  console.log('Admin Layout - User:', user?.email)
  
  if (userError || !user) {
    console.log('Admin Layout - No user found, redirecting to auth')
    redirect('/auth')
  }

  // Check admin status
  const { data: isAdmin, error: adminError } = await supabase
    .rpc('is_admin', { user_id: user.id })

  console.log('Admin Layout - Admin check result:', { isAdmin, adminError })
  
  if (adminError || !isAdmin) {
    console.log('Admin Layout - Not an admin, redirecting to home')
    redirect('/')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <TopBar />
          <main className="flex-1 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 