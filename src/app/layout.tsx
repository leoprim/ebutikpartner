import "./globals.css"
import { Toaster } from "sonner"
import { Inter } from "next/font/google"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"] })

export const metadata = {
  title: "Your App Title",
  description: "Your app description",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="font-sans font-medium bg-background text-foreground" suppressHydrationWarning>
        <Toaster />
        {children}
        <Script id="clean-cookies" strategy="beforeInteractive">
          {`
            // Disabled cookie cleanup as it was causing authentication issues
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
