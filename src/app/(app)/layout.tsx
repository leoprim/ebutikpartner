import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/topbar"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SupabaseProvider } from "@/components/supabase-provider"
import { NicheProvider } from "@/contexts/niche-context"

export const dynamic = 'force-dynamic'

export default async function AppLayout({
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

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth')
  }

  return (
    <SupabaseProvider>
      <SidebarProvider>
        <NicheProvider session={{ user }}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col w-full">
              <TopBar />
              <main className="flex-1 overflow-y-auto w-full">
                {children}
              </main>
            </div>
          </div>
        </NicheProvider>
      </SidebarProvider>
    </SupabaseProvider>
  )
} 