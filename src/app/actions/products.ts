'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface ProductDraft {
  title: string
  description: string
  images: string[]
  variants: any[]
  source_url: string
  price?: number
  compare_at_price?: number
  niche?: string
}

export async function createProduct(product: ProductDraft) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Optionally, check admin status here if needed

    const { error } = await supabase
      .from('products')
      .insert([
        {
          title: product.title,
          description: product.description,
          images: product.images,
          variants: product.variants,
          source_url: product.source_url,
          price: product.price,
          compare_at_price: product.compare_at_price,
          niche: product.niche,
        },
      ])

    if (error) {
      console.error('Error creating product:', error)
      throw new Error('Failed to create product')
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in createProduct:', error)
    throw error
  }
}

export async function updateProduct(id: string, product: ProductDraft) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { error } = await supabase
      .from('products')
      .update({
        title: product.title,
        description: product.description,
        images: product.images,
        variants: product.variants,
        source_url: product.source_url,
        price: product.price,
        compare_at_price: product.compare_at_price,
        niche: product.niche,
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating product:', error)
      throw new Error('Failed to update product')
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in updateProduct:', error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      console.error('Error deleting product:', error)
      throw new Error('Failed to delete product')
    }
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteProduct:', error)
    throw error
  }
} 