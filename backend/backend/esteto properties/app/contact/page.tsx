'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, Globe, Building2, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    setTimeout(() => {
      toast.success('Thank you! We will get back to you soon.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setLoading(false)
    }, 1000)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@esteto.com', 'support@esteto.com'],
      link: 'mailto:info@esteto.com',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 98765 43211'],
      link: 'tel:+919876543210',
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Gomti Nagar, Lucknow', 'Uttar Pradesh, India'],
      link: '#',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon - Fri: 9AM - 6PM', 'Sat - Sun: 10AM - 4PM'],
      link: '#',
      gradient: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-primary-100/20 to-cyan-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Get In Touch</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary-700 to-gray-900 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Contact Info Cards */}
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <Link
                  key={index}
                  href={info.link}
                  className="group relative"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:-translate-y-1">
                    <div className={`w-10 h-10 bg-gradient-to-br ${info.gradient} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{info.title}</h3>
                    <div className="space-y-0.5">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-xs text-gray-600 group-hover:text-primary-600 transition-colors leading-relaxed">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded"></div>
              <h2 className="text-3xl font-bold text-gray-900">Send us a Message</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Input
                    label="Your Name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    icon={<MessageCircle className="w-5 h-5" />}
                    required
                    className={focusedField === 'name' ? 'ring-2 ring-primary-500 border-primary-500' : ''}
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    icon={<Mail className="w-5 h-5" />}
                    required
                    className={focusedField === 'email' ? 'ring-2 ring-primary-500 border-primary-500' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    icon={<Phone className="w-5 h-5" />}
                    className={focusedField === 'phone' ? 'ring-2 ring-primary-500 border-primary-500' : ''}
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    icon={<Globe className="w-5 h-5" />}
                    required
                    className={focusedField === 'subject' ? 'ring-2 ring-primary-500 border-primary-500' : ''}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-h-[150px] resize-none ${
                    focusedField === 'message' 
                      ? 'ring-2 ring-primary-500 border-primary-500' 
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                  required
                />
                <div className={`absolute bottom-3 right-3 text-xs text-gray-400 transition-opacity ${
                  focusedField === 'message' ? 'opacity-0' : 'opacity-100'
                }`}>
                  {formData.message.length}/500
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg font-semibold" 
                loading={loading}
                disabled={loading}
              >
                {!loading && <Send className="w-5 h-5 mr-2" />}
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-6">
            {/* Office Location Card */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <Building2 className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Office</h3>
                <p className="text-primary-100 mb-6">
                  Visit our office in the heart of Lucknow. We're here to help you find your dream property.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Main Office</p>
                      <p className="text-primary-100">Gomti Nagar, Lucknow</p>
                      <p className="text-primary-100">Uttar Pradesh, India - 226010</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Response Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Quick Response</h3>
                  <p className="text-gray-600 text-sm">We typically reply within 24 hours</p>
                </div>
              </div>
              <p className="text-gray-600">
                Our team is committed to providing excellent customer service. For urgent matters, please call us directly.
              </p>
            </div>

            {/* Social Media / Additional Links */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <Link
                  href="#"
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-xl"
                >
                  <span className="text-xl font-bold">f</span>
                </Link>
                <Link
                  href="#"
                  className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-xl"
                >
                  <span className="text-xl font-bold">ig</span>
                </Link>
                <Link
                  href="#"
                  className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-xl"
                >
                  <span className="text-xl font-bold">in</span>
                </Link>
                <Link
                  href="#"
                  className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-xl"
                >
                  <span className="text-xl font-bold">yt</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
