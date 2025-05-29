"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  TrendingUp,
  Users,
  Crown,
  Plus,
  Filter,
  MoreHorizontal,
  Bookmark,
  Award,
  Image as ImageIcon,
  X as XIcon,
} from "lucide-react"

export default function Component() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const posts = [
    {
      id: 1,
      author: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@sarahstores",
      isPremium: true,
      timestamp: "2 hours ago",
      category: "success",
      title: "From $0 to $50K MRR in 8 months with dropshipping",
      content:
        "Just hit a major milestone! Started my dropshipping business 8 months ago with zero experience. Here's what worked: 1) Found a profitable niche (pet accessories), 2) Used TikTok ads instead of Facebook, 3) Focused on customer service. AMA!",
      likes: 127,
      comments: 34,
      shares: 18,
      tags: ["dropshipping", "tiktok-ads", "milestone"],
    },
    {
      id: 2,
      author: "Marcus Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@marcustech",
      isPremium: true,
      timestamp: "4 hours ago",
      category: "tips",
      title: "5 Email Marketing Hacks That Increased My Revenue by 300%",
      content:
        "Email marketing is still king! Here are 5 strategies that transformed my business: 1) Segmentation based on purchase behavior, 2) Abandoned cart sequences with social proof, 3) Post-purchase upsell flows, 4) Birthday campaigns, 5) Win-back campaigns for inactive subscribers.",
      likes: 89,
      comments: 22,
      shares: 31,
      tags: ["email-marketing", "conversion", "automation"],
    },
    {
      id: 3,
      author: "Emma Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@emmacrafts",
      isPremium: true,
      timestamp: "6 hours ago",
      category: "success",
      title: "How I scaled my handmade jewelry business to 6 figures",
      content:
        "Two years ago I was making jewelry as a hobby. Today I'm running a 6-figure business! Key lessons: invest in professional photography, build an email list from day one, and don't undervalue your work. The journey wasn't easy but so worth it!",
      likes: 156,
      comments: 45,
      shares: 28,
      tags: ["handmade", "jewelry", "scaling", "photography"],
    },
    {
      id: 4,
      author: "David Park",
      avatar: "/placeholder.svg?height=40&width=40",
      username: "@daviddigital",
      isPremium: true,
      timestamp: "8 hours ago",
      category: "tips",
      title: "The Psychology Behind High-Converting Product Pages",
      content:
        "After A/B testing 50+ product pages, here's what actually moves the needle: 1) Social proof above the fold, 2) Scarcity indicators (but be honest!), 3) Multiple payment options, 4) Clear return policy, 5) Mobile-first design. Details in comments!",
      likes: 203,
      comments: 67,
      shares: 42,
      tags: ["conversion", "psychology", "product-pages", "ab-testing"],
    },
  ]


  return (
    <div className="min-h-screen bg-background w-full">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-3xl font-medium text-gray-900">
                Gemenskap
              </h1>
              <p className="text-gray-600">Här delar vi våra erfarenheter, framgångar och motgångar</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Post Creation */}
            <Card>
              <CardHeader className="pb-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Skapa ett inlägg</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Title input and textarea grouped with a divider */}
                  <div className="flex-1 relative group bg-muted border border-border rounded-xl shadow-md overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/30">
                    <Input
                      placeholder="Titel på inlägg"
                      className="border-0 rounded-none shadow-none bg-transparent focus-visible:ring-0 focus-visible:border-0"
                    />
                    <Separator className="my-0" />
                    <Textarea
                      placeholder="Dela din erfarenhet eller tips med communityt"
                      className="min-h-[80px] border-0 rounded-none resize-none shadow-none bg-transparent focus-visible:ring-0 focus-visible:border-0 pr-32 pb-12"
                    />
                    {/* Image preview (if any) */}
                    {selectedImage && (
                      <div className="relative ml-2 mt-2 inline-block">
                        <img src={selectedImage} alt="Preview" className="h-12 w-12 object-cover rounded shadow border" />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow border hover:bg-muted"
                          onClick={() => setSelectedImage(null)}
                          aria-label="Ta bort bild"
                        >
                          <XIcon className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    )}
                    {/* Buttons inside input area */}
                    <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = ev => {
                                setSelectedImage(ev.target?.result as string)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                        <span className="inline-flex items-center justify-center rounded-full border border-muted-foreground bg-background p-2 hover:bg-muted transition-colors cursor-pointer shadow-sm">
                          <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </span>
                      </label>
                      <Button size="sm" className="h-10 px-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Dela
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3 sm:w-auto bg-card">
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="success">Success Stories</TabsTrigger>
                  <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search posts..." className="pl-10 bg-card border-0" />
                </div>
                <Button variant="outline" size="icon" className="bg-card border-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts
                .filter((post) => activeTab === "all" || post.category === activeTab)
                .map((post) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={post.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {post.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{post.author}</span>
                              {post.isPremium && (
                                <Badge variant="secondary" className="text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{post.username}</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-900">{post.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{post.content}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                            <Heart className="h-4 w-4 mr-2" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                            <Share2 className="h-4 w-4 mr-2" />
                            {post.shares}
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-purple-500">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2 text-gray-900">
                  <Award className="h-5 w-5 text-purple-600" />
                  Community Guidelines
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Share genuine success stories and actionable tips</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Be respectful and supportive of fellow entrepreneurs</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>No spam or self-promotion without value</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Use relevant tags to help others find your content</span>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Trending Topics
                </h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { tag: "tiktok-ads", posts: 23 },
                  { tag: "email-marketing", posts: 18 },
                  { tag: "conversion", posts: 15 },
                  { tag: "dropshipping", posts: 12 },
                  { tag: "scaling", posts: 9 },
                ].map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <span className="text-sm font-medium">#{topic.tag}</span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.posts} posts
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-green-600" />
                  Top Contributors
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Sarah Chen", username: "@sarahstores", posts: 47 },
                  { name: "Marcus Rodriguez", username: "@marcustech", posts: 34 },
                  { name: "Emma Thompson", username: "@emmacrafts", posts: 28 },
                ].map((contributor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="text-xs">
                        {contributor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-gray-900">{contributor.name}</div>
                      <div className="text-xs text-muted-foreground">{contributor.posts} posts</div>
                    </div>
                    <Crown className="h-4 w-4 text-purple-600" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 