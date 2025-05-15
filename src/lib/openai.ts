import { openai } from '@ai-sdk/openai'

// Function to verify API key is set
export function isApiKeySet(): boolean {
  // Check for API key in both client-exposed and server-only environment variables
  return Boolean(process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY)
}

// Function to generate blog post content
export async function generateBlogContent(topic: string, keywords: string, additionalInstructions?: string) {
  try {
    // Use our API route instead of calling OpenAI directly
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        keywords,
        additionalInstructions
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('Error generating blog content:', error)
    throw error
  }
} 