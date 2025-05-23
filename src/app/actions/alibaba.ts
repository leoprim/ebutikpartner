'use server'

import { execFile } from 'child_process'
import * as cheerio from 'cheerio'
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface AlibabaProduct {
  title: string
  description: string
  images: string[]
  variants: { name: string; options: { value: string; image?: string }[] }[]
}

function stripCodeBlock(html: string): string {
  return html
    .replace(/^```html\s*/i, '') // Remove ```html at the start
    .replace(/^```\s*/i, '')     // Remove ``` at the start
    .replace(/```\s*$/i, '')     // Remove ``` at the end
    .trim();
}

async function aiRewriteTitleAndDescription(title: string, description: string): Promise<{ title: string, description: string }> {
  const prompt = `
Du är en expert på e-handel och copywriting. Skriv om följande produktinformation på ett attraktivt och säljande sätt för en svensk e-handel. Titeln ska vara kort, slagkraftig och på svenska. Beskrivningen ska vara engagerande, konverterande, SEO-vänlig och presenteras som HTML för en produktsida. Notera att beskrivningen ska vara utförlig/lång och utgå enligt AIDA-modellen (utan att nämna dessa). Svara endast beskrivningen med HTML-koden. Undvik att lägga till knappar och andra uppmaningar till att köpa.

Svara ENDAST med följande format:

Titel: <din titel>

Beskrivning (HTML): <din HTML-beskrivning>

Titel:
${title}

Beskrivning:
${description}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.8,
  });

  const output = completion.choices[0].message.content || '';

  // Try to match both "Beskrivning (HTML):" and "Beskrivning:"
  const titleMatch = output.match(/Titel[:：]?\s*(.*)/i);
  const descMatch = output.match(/Beskrivning(?:\s*\(HTML\))?[:：]?\s*([\s\S]*)/i);

  let aiTitle = title;
  let aiDescription = description;

  if (titleMatch) {
    aiTitle = titleMatch[1].trim();
    if (descMatch) {
      aiDescription = descMatch[1].trim();
    } else {
      // If no explicit description match, use everything after the title
      const split = output.split(titleMatch[0]);
      if (split.length > 1) {
        aiDescription = split[1].trim();
      }
    }
  } else {
    // Fallback: use the whole output as description if nothing matches
    aiDescription = output.trim();
  }

  return {
    title: aiTitle,
    description: stripCodeBlock(aiDescription),
  };
}

export async function scrapeAlibabaProduct(url: string): Promise<AlibabaProduct> {
  if (!url.startsWith('https://www.alibaba.com/')) {
    throw new Error('Endast Alibaba-länkar stöds.')
  }

  // Use Railway API for scraping
  try {
    const response = await fetch('https://alibaba-ebutikpartner-production.up.railway.app/import-alibaba', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error('Railway API error: ' + errorText)
    }
    const data = await response.json()
    if (data && data.title) {
      // AI rewrite in Swedish
      const ai = await aiRewriteTitleAndDescription(data.title, data.description)
      return {
        title: ai.title,
        description: ai.description,
        images: Array.isArray(data.images) ? data.images : [],
        variants: Array.isArray(data.variants) ? data.variants : [],
      }
    }
    throw new Error('Railway API did not return valid product data.')
  } catch (e) {
    throw new Error('Kunde inte hämta produktdata från Railway API. ' + (typeof e === 'object' && e && 'message' in e ? (e as any).message : String(e)))
  }
} 