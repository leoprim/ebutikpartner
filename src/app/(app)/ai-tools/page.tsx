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
      title: "Blog Post Generator",
      description: "Generate human-like blog posts to boost your SEO and engagement. Automatically publish to your Shopify store.",
      icon: <FileText className="h-6 w-6 text-primary" />,
      badge: "Popular",
      category: "Content",
      link: "/blog-post-generator",
    },
    {
      title: "Image Generation",
      description: "Create stunning images from text descriptions or modify existing images with AI.",
      icon: <ImageIcon className="h-6 w-6 text-primary" />,
      badge: "Trending",
      category: "Creative",
    },
    {
      title: "Chatbot",
      description: "Build conversational AI assistants that can answer questions and provide support.",
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      badge: null,
      category: "Communication",
    },
    {
      title: "Code Assistant",
      description: "Get help with coding, debugging, and learning programming languages.",
      icon: <Code className="h-6 w-6 text-primary" />,
      badge: "Developer",
      category: "Productivity",
    },
    {
      title: "Video Generation",
      description: "Generate and edit videos with AI-powered tools and effects.",
      icon: <Video className="h-6 w-6 text-primary" />,
      badge: "Beta",
      category: "Creative",
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
                <CardDescription className="text-sm text-muted-foreground">Category: {tool.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{tool.description}</p>
              </CardContent>
              <CardFooter>
              {tool.link ? (
                <Button asChild className="w-full">
                  <Link href={tool.link}>Select Tool</Link>
                </Button>
              ) : (
                <Button className="w-full">Select Tool</Button>
              )}
            </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
