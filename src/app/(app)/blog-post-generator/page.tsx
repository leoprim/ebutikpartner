import Link from "next/link"
import { CalendarDays, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">Settings</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/blog-post-generator/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Scheduled Posts</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Posts scheduled for publication</p>
            </CardContent>
            <CardFooter>
              <Link href="/blog-post-generator/scheduled" className="text-xs text-primary hover:underline">
                View all scheduled posts
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Published Posts</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Total published blog posts</p>
            </CardContent>
            <CardFooter>
              <Link href="/blog-post-generator/published" className="text-xs text-primary hover:underline">
                View all published posts
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Engagement</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+28%</div>
              <p className="text-xs text-muted-foreground">Increase in engagement this month</p>
            </CardContent>
            <CardFooter>
              <Link href="/blog-post-generator/analytics" className="text-xs text-primary hover:underline">
                View detailed analytics
              </Link>
            </CardFooter>
          </Card>
        </div>

        <h2 className="mt-8 mb-4 text-xl font-medium">Recent Posts</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="line-clamp-1 font-medium">{post.title}</CardTitle>
                <CardDescription>
                  {post.status === "scheduled" ? (
                    <span className="text-amber-500 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Scheduled for {post.date}
                    </span>
                  ) : (
                    <span className="text-green-500">Published on {post.date}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog-post-generator/edit/${post.id}`}>Edit</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/blog-post-generator/preview/${post.id}`}>Preview</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

const recentPosts = [
  {
    id: 1,
    title: "10 Summer Fashion Trends for Your Online Store",
    excerpt:
      "Discover the hottest summer fashion trends that will help boost your Shopify store sales this season. From vibrant colors to sustainable materials, we cover it all.",
    date: "May 20, 2025",
    status: "published",
  },
  {
    id: 2,
    title: "How to Optimize Your Product Descriptions for SEO",
    excerpt:
      "Learn the secrets to writing product descriptions that not only convert customers but also rank well in search engines. Boost your organic traffic with these tips.",
    date: "May 25, 2025",
    status: "scheduled",
  },
  {
    id: 3,
    title: "The Ultimate Guide to Email Marketing for E-commerce",
    excerpt:
      "Email marketing remains one of the most effective channels for e-commerce. Discover how to build your list, create compelling campaigns, and drive more sales.",
    date: "May 28, 2025",
    status: "scheduled",
  },
]
