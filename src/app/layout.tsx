import "./globals.css"
import { Inter } from "next/font/google"
import Script from "next/script"
import { ToastHandler } from "@/components/toast-handler"
import { HeroUIProvider } from "@heroui/react"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"] })

export const metadata = {
  title: "StorePartner - Din butikspartner",
  description: "Hantera din förbyggda butik och öka din försäljning med AI-verktyg och marknadsföringsmallar",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className={inter.className}>
      <body className="font-sans font-medium bg-background text-foreground" suppressHydrationWarning>
        <HeroUIProvider>
          <Toaster 
            position="bottom-right"
            theme="light"
            className="toaster"
            toastOptions={{
              classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                success: "group-[.toast]:bg-green-50 group-[.toast]:text-green-800 group-[.toast]:border-green-200",
                error: "group-[.toast]:bg-red-50 group-[.toast]:text-red-800 group-[.toast]:border-red-200",
                title: "group-[.toast]:font-semibold",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              },
            }}
          />
          <ToastHandler />
          {children}
        </HeroUIProvider>
        <Script id="clean-cookies" strategy="beforeInteractive">
          {`            // Disabled cookie cleanup as it was causing authentication issues
            // Only enable for troubleshooting specific issues
            /* 
            try {
              // Find and only remove corrupted Supabase-related cookies (those with base64-eyJ)
              document.cookie.split(';').forEach(function(cookie) {
                const parts = cookie.trim().split('=');
                const name = parts[0];
                const value = parts.slice(1).join('=');
                
                if (name && 
                    (name.includes('supabase') || name.includes('sb-')) && 
                    (value.includes('base64-eyJ') || !value.startsWith('{') && value.length > 0)) {
                  console.log('Removing corrupted cookie:', name);
                  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                }
              });
              
              // Only clean localStorage items that are actually corrupted
              Object.keys(localStorage).forEach(key => {
                if (key.includes('supabase') || key.includes('sb-')) {
                  try {
                    const value = localStorage.getItem(key);
                    if (value && (value.includes('base64-eyJ') || (!value.startsWith('{') && !value.startsWith('[')))) {
                      console.log('Removing corrupted localStorage item:', key);
                      localStorage.removeItem(key);
                    }
                  } catch (e) {
                    // Only remove if there was an error parsing
                    localStorage.removeItem(key);
                  }
                }
              });
            } catch (err) {
              console.error('Error cleaning up cookies:', err);
            }
            */
          `}
        </Script>
      </body>
    </html>
  )
}

