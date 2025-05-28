"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Play,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Store,
  Plus,
} from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import SubscriptionModal from "@/components/subscription-modal"
import { Skeleton } from "@/components/ui/skeleton"
import OnboardingModal from "@/components/onboarding-modal"

export default function Component() {
  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
    }),
  }

  // Animation variants for onboarding steps
  const stepsContainerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.4, // delay after card anim
      },
    },
  }
  const stepItemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  type Stats = {
    omsattning?: number
    prevOmsattning?: number
    ordrar?: number
    prevOrdrar?: number
    kunder?: number
    produkter?: number
  } | null

  const [stats, setStats] = useState<Stats>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const router = useRouter()
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [hasNiche, setHasNiche] = useState<boolean | null>(null)
  const [hasWatchedGuide, setHasWatchedGuide] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Helper to calculate trend
  function getTrend(current?: number, prev?: number) {
    if (typeof current !== "number" || typeof prev !== "number") return null
    if (prev === 0) return current === 0 ? 0 : 100
    return ((current - prev) / Math.abs(prev)) * 100
  }

  const omsattningTrend = getTrend(stats?.omsattning, stats?.prevOmsattning)
  const ordrarTrend = getTrend(stats?.ordrar, stats?.prevOrdrar)

  useEffect(() => {
    setLoadingStats(true)
    fetch("/api/shopify/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoadingStats(false)
      })
      .catch(() => setLoadingStats(false))
  }, [])

  useEffect(() => {
    const checkPremium = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single()
        setIsPremium(profile?.is_premium ?? false)
      } else {
        setIsPremium(false)
      }
    }
    checkPremium()
  }, [])

  // Fetch onboarding step status
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // Check niche
      const { data: storeOrder } = await supabase
        .from('store_orders')
        .select('niche')
        .eq('user_id', user.id)
        .maybeSingle()
      setHasNiche(!!(storeOrder && storeOrder.niche && storeOrder.niche !== ''))
      // Check if any video is completed
      const { data: videoProgress } = await supabase
        .from('video_progress')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
      setHasWatchedGuide(!!(videoProgress && videoProgress.length > 0))
    }
    fetchOnboardingStatus()
  }, [])

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user && !data.user.user_metadata?.full_name) {
        setShowOnboarding(true);
      }
    });
  }, []);

  // Always render steps in the same order, but swap content for premium/launch if needed
  const launchStep = {
    key: 'launch',
    icon: <Clock className="w-5 h-5 text-gray-400" />,
    text: 'Lansera din butik',
    checked: false,
    textClass: 'text-gray-500',
  };
  const premiumStep = {
    key: 'premium',
    icon: isPremium === null ? <Clock className="w-5 h-5 text-gray-400" /> : isPremium ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-gray-400" />,
    text: 'Uppgradera till Premium för mer funktioner',
    checked: !!isPremium,
    textClass: isPremium ? 'text-gray-700' : 'text-gray-500',
  };
  const stepsToRender = [
    {
      key: 'store',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      text: 'Beställ din färdigbyggda butik',
      checked: true,
      textClass: 'text-gray-700',
    },
    {
      key: 'niche',
      icon: hasNiche === null ? <Clock className="w-5 h-5 text-gray-400" /> : hasNiche ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-gray-400" />,
      text: 'Välj en nisch för din butik',
      checked: !!hasNiche,
      textClass: hasNiche ? 'text-gray-700' : 'text-gray-500',
    },
    {
      key: 'guide',
      icon: hasWatchedGuide === null ? <Clock className="w-5 h-5 text-gray-400" /> : hasWatchedGuide ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-gray-400" />,
      text: 'Ta del av våra guider',
      checked: !!hasWatchedGuide,
      textClass: hasWatchedGuide ? 'text-gray-700' : 'text-gray-500',
    },
    ...(isPremium ? [premiumStep, launchStep] : [launchStep, premiumStep]),
  ]

  // Calculate onboarding progress
  const completedSteps = stepsToRender.filter(step => step.checked).length
  const totalSteps = stepsToRender.length
  const onboardingProgress = Math.round((completedSteps / totalSteps) * 100)

  return (
    <>
      <OnboardingModal
        open={showOnboarding}
        onComplete={async () => {
          setShowOnboarding(false);
          // Refresh user from Supabase
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const { data } = await supabase.auth.getUser();
          setUser(data.user ?? null);
        }}
        user={user}
      />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <SubscriptionModal open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal} />
        <div className="w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div>
              <h1 className="text-3xl font-medium text-gray-900">Instrumentpanel</h1>
              <p className="text-gray-600 mt-1">Välkommen tillbaka! Här är det senaste som händer i din butik.</p>
            </div>
            <Button className="w-fit">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visa butik
            </Button>
          </div>

          {/* Onboarding Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              className="lg:col-span-2"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card className="border-blue-200 bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-black font-medium text-lg">Kom igång med din butik</CardTitle>
                      <CardDescription className="text-primar">
                        Slutför dessa steg för att optimera din Shopify-butik
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-secondary text-primary">
                      {completedSteps}/{totalSteps} slutförda
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <Progress value={onboardingProgress} className="h-2" />
                  </motion.div>
                  <motion.div
                    className="space-y-3"
                    variants={stepsContainerVariants}
                    initial="hidden"
                    animate="visible"
                    key={stepsToRender.map(s => s.key).join('-')}
                  >
                    {stepsToRender.map(step => {
                      return (
                        <motion.div
                          key={step.key}
                          className="flex items-center gap-3"
                          variants={stepItemVariants}
                        >
                          {step.icon}
                          <span className={`text-sm ${step.textClass}`}>{step.text}</span>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                  {(!hasNiche || (!hasWatchedGuide && hasNiche)) && (
                    <Button
                      className="w-full mt-4"
                      onClick={() => {
                        if (!hasNiche) {
                          router.push('/store')
                        } else if (!hasWatchedGuide) {
                          router.push('/guides-library')
                        }
                      }}
                    >
                      {!hasNiche ? (
                        <>
                          Välj nisch för min butik
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Gå till guiderna
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Video Card */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Introduktion</CardTitle>
                  <CardDescription>Vi rekommenderar att du kollar på videon för att få ut det mesta av din butik</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden group cursor-pointer">
      <video
        controls
        preload="metadata"
        className="w-full h-full object-cover"
      >
        <source src="https://iozuanlnbqyykvkfwacl.supabase.co/storage/v1/object/public/videos//E-Butik%20Partner.se%20V2%20.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>

                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total omsättning</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="min-h-[60px] flex flex-col justify-center">
                  <div className="text-2xl font-bold">
                    {loadingStats ? (
                      <Skeleton className="h-7 w-16 rounded" />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        {stats?.omsattning?.toLocaleString("sv-SE", { style: "currency", currency: "SEK" })}
                      </motion.div>
                    )}
                  </div>
                  <div className={
                    `flex items-center text-xs ${omsattningTrend == null ? "text-muted-foreground" : omsattningTrend > 0 ? "text-green-600" : omsattningTrend < 0 ? "text-red-600" : "text-gray-500"}`
                  }>
                    {omsattningTrend == null ? null : omsattningTrend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : omsattningTrend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <span className="w-3 h-3 mr-1" />}
                    {omsattningTrend == null ? "" : `${omsattningTrend > 0 ? "+" : ""}${omsattningTrend.toFixed(1)}% från förra månaden`}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ordrar</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="min-h-[60px] flex flex-col justify-center">
                  <div className="text-2xl font-bold">
                    {loadingStats ? (
                      <Skeleton className="h-7 w-10 rounded" />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        {stats?.ordrar ?? "-"}
                      </motion.div>
                    )}
                  </div>
                  <div className={
                    `flex items-center text-xs ${ordrarTrend == null ? "text-muted-foreground" : ordrarTrend > 0 ? "text-green-600" : ordrarTrend < 0 ? "text-red-600" : "text-gray-500"}`
                  }>
                    {ordrarTrend == null ? null : ordrarTrend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : ordrarTrend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <span className="w-3 h-3 mr-1" />}
                    {ordrarTrend == null ? "" : `${ordrarTrend > 0 ? "+" : ""}${ordrarTrend.toFixed(1)}% från förra månaden`}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Kunder</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="min-h-[60px] flex flex-col justify-center">
                  <div className="text-2xl font-bold">
                    {loadingStats ? (
                      <Skeleton className="h-7 w-10 rounded" />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        {stats?.kunder ?? "-"}
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produkter</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="min-h-[60px] flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {loadingStats ? (
                        <Skeleton className="h-7 w-10 rounded" />
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          {stats?.produkter ?? "-"}
                        </motion.div>
                      )}
                    </div>
                    <button
                      className="group relative ml-2 rounded-full bg-primary text-white w-8 h-8 flex items-center justify-center hover:bg-primary/90 transition-all duration-300 ease-in-out hover:w-[160px] overflow-hidden"
                      onClick={() => {
                        if (isPremium) {
                          router.push("/product-library")
                        } else {
                          setShowSubscriptionModal(true)
                        }
                      }}
                      disabled={isPremium === null}
                      aria-label="Lägg till produkt"
                    >
                      <Plus className="w-5 h-5 transition-all duration-300 ease-in-out group-hover:opacity-0" />
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap text-sm flex items-center justify-center">
                        Lägg till produkter
                      </span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Latest News */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-medium text-lg">
                    <Calendar className="w-5 h-5" />
                    Senaste nytt & uppdateringar
                  </CardTitle>
                  <CardDescription>Håll dig uppdaterad med de senaste plattformsfunktionerna och e-handelstrenderna</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-sm">Ny analysinstrumentpanel lanserad</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Få djupare insikter om din butiks prestanda med våra förbättrade analysverktyg.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">För 2 dagar sedan</p>
                    </div>

                    <Separator />

                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium text-sm">Guide för förberedelser inför högtidssäsongen</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Viktiga tips för att maximera din försäljning under den kommande högtidssäsongen.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">För 1 vecka sedan</p>
                    </div>

                    <Separator />

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-medium text-sm">Uppdateringar för mobiloptimering</h4>
                      <p className="text-sm text-gray-600 mt-1">Dina butiksteman laddar nu 40% snabbare på mobila enheter.</p>
                      <p className="text-xs text-gray-500 mt-2">För 2 veckor sedan</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    Visa alla nyheter
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pre-built Store Info */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-medium text-lg">
                    <Store className="w-5 h-5 text-black" />
                    Din beställning
                  </CardTitle>
                  <CardDescription>Färdigbyggd butik med produkt och leverantör</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
                    <img
                      src="/ehandelmockup.jpg"
                      alt="Butiksförhandsvisning"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Butiksvärde</span>
                      <span className="text-lg font-bold text-primary">9 995:-</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Premiumtema ingår (värde 1 995:-)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Produkt & leverantör</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">SEO-optimerad</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Högkonverterande element</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button className="flex-1">Välj butikens nisch</Button>
                      <Button variant="outline" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
