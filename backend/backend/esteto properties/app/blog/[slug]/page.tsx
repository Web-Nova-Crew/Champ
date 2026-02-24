'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Share2, Tag, MessageCircle, Send } from 'lucide-react'
import { mockBlogPosts, BlogPost } from '@/lib/mock-blog-data'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function BlogPostPage() {
  const params = useParams()
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const post = mockBlogPosts.find(p => p.slug === params.slug)
  const relatedPosts = mockBlogPosts.filter(p => p.id !== post?.id && p.category === post?.category).slice(0, 3)

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle comment submission
    alert('Comment submitted! (This is a demo)')
    setComment('')
    setName('')
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="container-custom relative z-10 h-full flex items-end pb-8">
          <div className="max-w-4xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white mb-4 hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            <div className="flex items-center gap-4 mb-4 text-white/90 text-sm">
              <span className="px-3 py-1 bg-primary-600 rounded-full font-medium">
                {post.category}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime} min read
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white">
                  <Image
                    src={post.authorImage}
                    alt={post.author}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{post.author}</p>
                  <p className="text-sm text-white/80">{post.views} views</p>
                </div>
              </div>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary-600 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-200">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?search=${tag}`}
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Find Your Dream Property?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Browse our extensive collection of properties in Lucknow and find the perfect home or investment opportunity.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/properties">
                  <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                    Browse Properties
                  </Button>
                </Link>
                <Link href="/properties/add">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    List Your Property
                  </Button>
                </Link>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <MessageCircle className="w-8 h-8 text-primary-600" />
                Comments
              </h2>
              
              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <textarea
                  placeholder="Write your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                />
                <div className="mt-4">
                  <Button type="submit" className="gap-2">
                    <Send className="w-4 h-4" />
                    Post Comment
                  </Button>
                </div>
              </form>

              {/* Sample Comments */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                        alt="User"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">Rajesh Kumar</h4>
                        <span className="text-sm text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-gray-700">
                        Great article! These tips really helped me when I was buying my first home. Thanks for sharing!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                        alt="User"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">Priya Sharma</h4>
                        <span className="text-sm text-gray-500">5 days ago</span>
                      </div>
                      <p className="text-gray-700">
                        Very informative post. I especially found the section about property documents helpful.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="space-y-6">
              {/* Author Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About the Author</h3>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src={post.authorImage}
                      alt={post.author}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{post.author}</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Real Estate Expert with years of experience in the Lucknow market.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Related Posts</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
                              {relatedPost.title}
                            </h4>
                            <p className="text-xs text-gray-500">{relatedPost.publishedAt}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary-600" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {Array.from(new Set(mockBlogPosts.map(p => p.category))).map((category) => (
                    <Link
                      key={category}
                      href={`/blog?category=${category}`}
                      className="block px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

