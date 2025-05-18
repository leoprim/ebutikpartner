"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, MessageSquare, ImageIcon, Code, FileText, Music, Video, Sparkles, Zap, Bot, Link as LinkIcon } from "lucide-react"
import Link from "next/link"

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

export default function AIToolsPage() {
  const aiTools = [
    {
      title: "Blogginlägg Generering",
      description: "Skapa människoliknande blogginlägg för att öka din SEO och ditt engagemang. Publicera automatiskt till din Shopify-butik.",
      icon: <FileText className="h-6 w-6 text-primary" />,
      badge: "Populärt",
      category: "Innehåll",
      link: "/blog-post-generator",
    },
    {
      title: "Textgenerering",
      description: "Skapa högkonverterande text till annonser, produktbeskrivningar eller blogginlägg.",
      icon: <ImageIcon className="h-6 w-6 text-primary" />,
      badge: "Trendar",
      category: "Kreativt",
    },
    {
      title: "Bakgrundsborttagare",
      description: "Ladda upp produktbilder och få bakgrunden borttagen för professionellt utseende.",
      icon: <Code className="h-6 w-6 text-primary" />,
      badge: "Visuellt",
      category: "Innehåll",
    },
  ]

  return (
    <div className="w-full p-6">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {aiTools.map((tool, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 rounded-lg">{tool.icon}</div>
                  {tool.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {tool.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4 font-medium text-lg">{tool.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Kategori: {tool.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{tool.description}</p>
              </CardContent>
              <CardFooter>
              {tool.link ? (
                <Button asChild className="w-full">
                  <Link href={tool.link}>Välj verktyg</Link>
                </Button>
              ) : (
                <Button className="w-full">Välj verktyg</Button>
              )}
            </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
