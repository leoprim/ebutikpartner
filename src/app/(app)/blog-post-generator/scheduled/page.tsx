import Link from "next/link"
import { ArrowLeft, Calendar, Edit, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ScheduledPosts() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 md:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/blog-post-generator">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Scheduled Posts</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Publications</CardTitle>
            <CardDescription>Manage your scheduled blog posts for your Shopify store</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {post.date}
                      </div>
                    </TableCell>
                    <TableCell>{post.topic}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/blog-post-generator/edit/${post.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/blog-post-generator/preview/${post.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

const scheduledPosts = [
  {
    id: 1,
    title: "How to Optimize Your Product Descriptions for SEO",
    date: "May 25, 2025",
    topic: "E-commerce Tips",
  },
  {
    id: 2,
    title: "The Ultimate Guide to Email Marketing for E-commerce",
    date: "May 28, 2025",
    topic: "Marketing Strategies",
  },
  {
    id: 3,
    title: "Summer Collection 2025: What's Trending",
    date: "June 1, 2025",
    topic: "Fashion & Apparel",
  },
]
