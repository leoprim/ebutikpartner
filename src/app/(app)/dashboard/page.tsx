"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ArrowRight, 
  BarChart3, 
  ShoppingBag, 
  Store, 
  Users, 
  CheckCircle2, 
  Circle,
  LayoutDashboard,
  Zap,
  Bell,
  ChevronRight,
  Badge
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export default function DashboardPage() {
  const [isLoading] = useState(false)
  const [userName, setUserName] = useState<string>("")
  
  const [onboardingSteps] = useState([
    { id: 1, title: "Köp en skräddarsydd butik", completed: true },
    { id: 2, title: "Välj din nisch", completed: false },
    { id: 3, title: "Guidesbibliotek och lite popcorn 🍿", completed: false },
    { id: 4, title: "Gå Premium för fler funktioner", completed: false },
  ])

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata?.full_name) {
          const firstName = user.user_metadata.full_name.split(' ')[0]
          setUserName(firstName)
        }
      } catch (error) {
        console.error('Error in fetchUserName:', error)
      }
    }

    fetchUserName()
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <div className="flex-1 p-6">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-6">
              <h2 className="text-2xl font-medium mb-4">
                Välkommen {userName} till StorePartner! 🎉
              </h2>
              <p className="text-muted-foreground mb-6">
                Låt oss få igång din butik. Följ dessa steg för att slutföra din konfiguration.
              </p>
              <div className="space-y-4">
                {onboardingSteps.map((step) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={step.completed ? "text-muted-foreground line-through" : ""}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center rounded-lg">
              <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://iozuanlnbqyykvkfwacl.supabase.co/storage/v1/object/public/videos//E-Butik%20Partner.se%20V2%20.mp4"
                  title="Welcome to StorePartner"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <p className="text-muted-foreground">Välkommen tillbaka! Här är en översikt av din butik.</p>
        </div>
      </motion.div>

      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-medium text-lg">Butiksöversikt</CardTitle>
                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription className="font-normal">Spåra din butiks framsteg och prestanda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center">
                    <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Butiksstatus</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Pågående</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Nisch</span>
                  </div>
                  <span className="text-sm font-medium">Hälsa & Skönhet</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Supporttimmar</span>
                  </div>
                  <span className="text-sm font-medium">1 timme kvar</span>
                </div>
                <Button variant="outline" className="w-full justify-start">
                  Visa butiksdetaljer
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-medium text-lg">Snabbåtgärder</CardTitle>
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription className="font-normal">Vanliga uppgifter och genvägar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Store className="mr-2 h-4 w-4" />
                  Visa butik
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Hantera produkter
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Visa analys
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-medium text-lg">Nyheter</CardTitle>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription className="font-normal">Senaste uppdateringarna och tillkännagivandena</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button className="w-full flex items-start gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors text-left">
                  <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1 text-left">
                    <p className="text-sm font-medium">Nya AI-funktioner släppta</p>
                    <p className="text-xs text-muted-foreground">Förbättrade produktrekommendationer och kundinsikter</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                </button>
                <button className="w-full flex items-start gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors text-left">
                  <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                    <LayoutDashboard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1 text-left">
                    <p className="text-sm font-medium">Plattformsuppdatering v2.1</p>
                    <p className="text-xs text-muted-foreground">Förbättrad prestanda och nya instrumentpanelsfunktioner</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
