import { MetadataRoute } from 'next'
import { createSupabaseClient } from '@/lib/supabase/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://estato.com'
  
  // Static pages with high priority
  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/properties`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/about`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/blog`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/emi-calculator`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/agents`, priority: 0.8, changeFrequency: 'weekly' as const },
  ]

  // Try to fetch dynamic properties for sitemap
  let dynamicUrls: MetadataRoute.Sitemap = []
  
  try {
    const supabase = createSupabaseClient()
    if (supabase) {
      // Fetch active properties
      const { data: properties } = await supabase
        .from('properties')
        .select('id, updated_at')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(100)

      if (properties) {
        dynamicUrls = properties.map((property) => ({
          url: `${baseUrl}/properties/${property.id}`,
          lastModified: new Date(property.updated_at || Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
      }
    }
  } catch (error) {
    console.error('Failed to fetch properties for sitemap:', error)
  }

  // Fetch blog posts
  let blogUrls: MetadataRoute.Sitemap = []
  try {
    const supabase = createSupabaseClient()
    if (supabase) {
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })

      if (posts) {
        blogUrls = posts.map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at || Date.now()),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
      }
    }
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error)
  }

  const now = new Date()

  return [
    ...staticPages.map(page => ({
      url: page.url,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...dynamicUrls,
    ...blogUrls,
  ]
}
