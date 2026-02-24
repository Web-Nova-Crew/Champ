'use client'

import Image from 'next/image'
import { Building2, Users, Award, Target, Heart, TrendingUp, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AboutPage() {
  const stats = [
    { icon: Building2, label: 'Properties Listed', value: '10,000+', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Users, label: 'Happy Clients', value: '5,000+', gradient: 'from-primary-500 to-primary-700' },
    { icon: Award, label: 'Years of Experience', value: '15+', gradient: 'from-purple-500 to-pink-500' },
    { icon: TrendingUp, label: 'Success Rate', value: '98%', gradient: 'from-orange-500 to-red-500' },
  ]

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: "We prioritize our clients' needs and satisfaction above all else. Your dream property is our mission.",
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: Target,
      title: 'Integrity',
      description: 'Transparency and honesty in every transaction. We believe in building trust through ethical practices.',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in service delivery, ensuring the best experience for property seekers and sellers.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Innovation',
      description: 'Leveraging technology to simplify property search and make real estate transactions seamless.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  const features = [
    'Advanced Property Search & Filters',
    'Verified Property Listings',
    '24/7 Customer Support',
    'Expert Property Consultants',
    'Legal Documentation Support',
    'Property Valuation Services',
    'Virtual Property Tours',
    'Secure Transaction Process',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative text-white py-8 md:py-12 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
              alt="About Esteto Properties"
              fill
              className="object-cover"
              priority
            />
            {/* Dark Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/70 to-primary-900/80"></div>
          </div>
          <div className="container-custom relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">About Esteto Properties</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
                Your Trusted Real Estate Partner
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                We connect people with their dream properties in Lucknow. With years of experience and a commitment to excellence, we make property buying and renting seamless.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 -mt-8">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:-translate-y-2"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                )
              })}
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
                    <Building2 className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">Our Story</span>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    Building Dreams, One Property at a Time
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      Esteto Properties was founded with a vision to revolutionize the real estate industry in Lucknow. We recognized the challenges people face when searching for their perfect home or commercial space, and we set out to make the process easier, more transparent, and more efficient.
                    </p>
                    <p>
                      Over the years, we've built a reputation for integrity, reliability, and excellence. Our team of experienced real estate professionals is dedicated to understanding your needs and helping you find the property that matches your dreams and budget.
                    </p>
                    <p>
                      Today, we're proud to be one of the most trusted real estate platforms in Lucknow, helping thousands of families and businesses find their ideal properties.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden h-full min-h-[400px] shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                      alt="Building Dreams"
                      fill
                      className="object-cover"
                    />
                    {/* Overlay with stats */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-primary-800/50 to-primary-900/60 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-5xl font-bold mb-2 drop-shadow-lg">15+</div>
                        <div className="text-xl font-medium drop-shadow-md">Years of Excellence</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-2xl opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  The principles that guide everything we do
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                )
              })}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 border border-white/20">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
                  <p className="text-xl text-gray-600">
                    Everything you need for a seamless real estate experience
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg hover:bg-primary-50 transition-colors group">
                      <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold mb-4">Ready to Find Your Dream Property?</h2>
                  <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                    Join thousands of satisfied customers who found their perfect home through Esteto Properties
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/properties">
                      <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg">
                        Browse Properties
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
