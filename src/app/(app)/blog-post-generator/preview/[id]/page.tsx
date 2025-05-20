import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

type PageProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Simulate post data fetch for the example
async function getPostData(id: string) {
  // In a real app, we would fetch the post data from an API or database
  return {
    id,
    title: "How to Optimize Your Product Descriptions for SEO",
    date: "May 25, 2025",
    author: "AI Assistant",
    coverImage: "/ecommerce-product-shot.png",
    content: `
      <h1>How to Optimize Your Product Descriptions for SEO</h1>
      
      <p>In the competitive world of e-commerce, having well-optimized product descriptions can make a significant difference in your store's visibility and sales. Search engine optimization (SEO) for product descriptions isn't just about ranking higher in search results—it's about connecting potential customers with the products they're looking for.</p>
      
      <h2>Why Product Description SEO Matters</h2>
      
      <p>Product descriptions are often overlooked as an SEO opportunity, but they're crucial touchpoints for both search engines and customers. Well-optimized descriptions can:</p>
      
      <ul>
        <li>Improve your visibility in search engine results</li>
        <li>Drive more qualified traffic to your product pages</li>
        <li>Increase conversion rates by providing relevant information</li>
        <li>Reduce bounce rates by meeting searcher intent</li>
      </ul>
      
      <h2>Key Elements of SEO-Friendly Product Descriptions</h2>
      
      <h3>1. Keyword Research and Implementation</h3>
      
      <p>Start with thorough keyword research to understand what terms potential customers are using to find products like yours. Tools like Google Keyword Planner, Ahrefs, or SEMrush can help identify relevant keywords with good search volume and reasonable competition.</p>
      
      <p>Once you've identified your target keywords, incorporate them naturally into your product descriptions. Focus on:</p>
      
      <ul>
        <li>Including your primary keyword in the product title</li>
        <li>Using secondary keywords throughout the description</li>
        <li>Incorporating long-tail keywords that match specific search queries</li>
      </ul>
      
      <h3>2. Unique and Compelling Content</h3>
      
      <p>Search engines penalize duplicate content, so avoid copying manufacturer descriptions. Instead, create unique content that:</p>
      
      <ul>
        <li>Highlights the unique selling points of your product</li>
        <li>Addresses customer pain points and questions</li>
        <li>Uses engaging, persuasive language that encourages purchases</li>
      </ul>
      
      <h3>3. Structured Content Format</h3>
      
      <p>Make your product descriptions easy to scan by using:</p>
      
      <ul>
        <li>Short paragraphs (2-3 sentences max)</li>
        <li>Bullet points for features and specifications</li>
        <li>Subheadings to organize information</li>
        <li>Bold text to emphasize key points</li>
      </ul>
      
      <h2>Advanced SEO Techniques for Product Descriptions</h2>
      
      <h3>1. Schema Markup</h3>
      
      <p>Implement product schema markup to help search engines understand your product information better. This structured data can lead to rich snippets in search results, displaying information like price, availability, and reviews directly in the search results.</p>
      
      <h3>2. Natural Language and Semantic SEO</h3>
      
      <p>Modern search engines understand context and semantics. Rather than keyword stuffing, focus on:</p>
      
      <ul>
        <li>Using natural language that flows well</li>
        <li>Including related terms and synonyms</li>
        <li>Answering questions your customers might have</li>
      </ul>
      
      <h3>3. Mobile Optimization</h3>
      
      <p>With mobile commerce growing rapidly, ensure your product descriptions are mobile-friendly:</p>
      
      <ul>
        <li>Keep paragraphs even shorter for mobile screens</li>
        <li>Front-load important information</li>
        <li>Use a responsive design that adapts to screen size</li>
      </ul>
      
      <h2>Measuring Success</h2>
      
      <p>After optimizing your product descriptions, track your results using:</p>
      
      <ul>
        <li>Google Analytics to monitor traffic and conversion rates</li>
        <li>Google Search Console to track keyword rankings and impressions</li>
        <li>A/B testing different description formats to see what works best</li>
      </ul>
      
      <h2>Conclusion</h2>
      
      <p>Optimizing your product descriptions for SEO is an ongoing process that requires attention to detail and regular updates. By focusing on relevant keywords, creating unique and valuable content, and structuring your descriptions effectively, you can improve your Shopify store's visibility and drive more sales.</p>
      
      <p>Remember that the best product descriptions serve both search engines and human readers—they're discoverable, informative, and persuasive.</p>
    `,
  }
}

export default async function PostPreview({ params }: PageProps) {
  const post = await getPostData(params.id)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/blog-post-generator/scheduled">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Post Preview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/edit/${post.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Post
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Calendar className="mr-1 h-4 w-4" />
              <span>Scheduled for {post.date}</span>
              <span className="mx-2">•</span>
              <span>By {post.author}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
              <Image src={post.coverImage || "/placeholder.svg"} alt="Cover image" fill className="object-cover" />
            </div>
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </div>
      </main>
    </div>
  )
}
