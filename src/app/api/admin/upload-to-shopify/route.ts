import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { orderId, productId } = await request.json()
    if (!orderId || !productId) {
      return NextResponse.json({ error: 'orderId and productId are required' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Fetch store order (for Shopify credentials)
    const { data: order, error: orderError } = await supabase
      .from('store_orders')
      .select('shopify_domain, shopify_access_token')
      .eq('id', orderId)
      .single()
    if (orderError || !order) {
      return NextResponse.json({ error: 'Store order not found' }, { status: 404 })
    }
    if (!order.shopify_domain || !order.shopify_access_token) {
      return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 400 })
    }

    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Map product to Shopify format
    // First, build images array and keep track of their order
    const images = (product.images || []).map((url: string) => ({ src: url }))
    // Build options and variants
    const options = (product.variants || []).map((variant: any) => ({ name: variant.name }))
    // Prepare variants with price, compare_at_price (no image association)
    let variants: any[] = []
    if (product.variants && product.variants.length > 0) {
      // For each option (e.g. color), create a variant for each option value
      variants = product.variants[0].options.map((opt: any) => {
        return {
          option1: opt.value,
          title: opt.value,
          options: [opt.value],
          price: product.price ?? undefined,
          compare_at_price: product.compare_at_price ?? undefined,
        }
      })
    }
    const shopifyProduct = {
      product: {
        title: product.title,
        body_html: product.description,
        images,
        options,
        variants,
      }
    }

    // Call Shopify Admin API to create the product
    const shopifyRes = await fetch(`https://${order.shopify_domain}/admin/api/2023-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': order.shopify_access_token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(shopifyProduct),
    })
    if (!shopifyRes.ok) {
      const errorText = await shopifyRes.text()
      return NextResponse.json({ error: errorText }, { status: 500 })
    }
    const shopifyData = await shopifyRes.json()

    // --- NEW LOGIC: Attach images to variants ---
    // Only run if there are variants and images with variant association
    if (product.variants && product.variants.length > 0 && Array.isArray(product.variants[0].options)) {
      const shopifyVariants = shopifyData.product.variants; // Shopify's variant objects
      const yourVariants = product.variants[0].options; // Your original variant options
      for (const opt of yourVariants) {
        if (opt.image) {
          // Find the Shopify variant with the same option value
          const shopifyVariant = shopifyVariants.find((v: any) => v.option1 === opt.value);
          if (shopifyVariant) {
            // POST the image to Shopify and associate with this variant
            await fetch(`https://${order.shopify_domain}/admin/api/2023-10/products/${shopifyData.product.id}/images.json`, {
              method: 'POST',
              headers: {
                'X-Shopify-Access-Token': order.shopify_access_token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                image: {
                  src: opt.image,
                  variant_ids: [shopifyVariant.id],
                }
              }),
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, shopifyProduct: shopifyData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
} 