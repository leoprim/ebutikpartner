import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Get the OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Get request data
    const { topic, keywords, additionalInstructions } = await request.json()

    // Validate required fields
    if (!topic || !keywords) {
      return NextResponse.json(
        { error: 'Topic and keywords are required' },
        { status: 400 }
      )
    }

    // Create prompt for OpenAI
    const promptText = `Write a comprehensive blog post about ${topic} for a Shopify store. 
    Include the following keywords: ${keywords}. 
    ${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ""}
    
    The blog post should be informative, engaging, and optimized for SEO. 
    Include a catchy title, introduction, several subheadings, and a conclusion.`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional blog writer for e-commerce websites who creates engaging, SEO-optimized content.'
          },
          {
            role: 'user',
            content: promptText
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return NextResponse.json({ content: data.choices[0].message.content })

  } catch (error) {
    console.error('Error generating blog content:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
} 