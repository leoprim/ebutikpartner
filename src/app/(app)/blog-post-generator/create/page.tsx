"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import RichEditor from "@/components/rich-editor"
import TopicSelector from "@/components/topic-selector"
import DatePicker from "@/components/date-picker"
import { generateBlogContent } from "@/lib/openai"
import { toast } from "react-hot-toast"

export default function CreatePost() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [prompt, setPrompt] = useState("")
  const [content, setContent] = useState("")
  const [publishDate, setPublishDate] = useState<Date | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic)
  }

  const generateContent = async () => {
    if (!topic || !keywords) {
      toast.error("Please select a topic and enter keywords")
      return
    }

    setIsGenerating(true)
    try {
      const text = await generateBlogContent(topic, keywords)
      setContent(text)
      setActiveTab("edit")
      toast.success("Blog post generated successfully!")
    } catch (error) {
      console.error("Error generating content:", error)
      toast.error("Failed to generate content. Please check your API key and try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    // In a real app, this would save to Shopify via API
    toast.success("Post saved and scheduled for publication!")
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 md:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Create New Blog Post</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Content</TabsTrigger>
              <TabsTrigger value="edit" disabled={!content}>
                Edit & Schedule
              </TabsTrigger>
            </TabsList>
            <TabsContent value="generate">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Blog Topic</Label>
                      <TopicSelector onTopicChange={handleTopicChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keywords">Keywords (comma separated)</Label>
                      <Input
                        id="keywords"
                        placeholder="e.g., summer fashion, trends, sustainable"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Additional Instructions (optional)</Label>
                      <Textarea
                        id="prompt"
                        placeholder="Any specific points you want to include in the blog post"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={generateContent} 
                      disabled={isGenerating || !topic || !keywords} 
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Content...
                        </>
                      ) : (
                        "Generate Blog Post"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="edit">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Blog Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter blog post title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <RichEditor initialContent={content} onChange={setContent} />
                    </div>
                    <div className="space-y-2">
                      <Label>Publication Date</Label>
                      <div className="flex items-center gap-2">
                        <DatePicker date={publishDate} onDateChange={setPublishDate} />
                        <span className="text-sm text-muted-foreground">
                          {!publishDate ? "Select a date to schedule" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setActiveTab("generate")}>
                        Back to Generate
                      </Button>
                      <Button onClick={handleSave}>
                        {publishDate ? (
                          <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Post
                          </>
                        ) : (
                          "Save as Draft"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
