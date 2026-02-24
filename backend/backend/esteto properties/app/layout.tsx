import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DemoBanner from '@/components/DemoBanner'
import StructuredData from './structured-data'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://estato.com'),
  title: {
    default: 'Estato - Premium Properties for Sale & Rent in Lucknow | #1 Real Estate Platform',
    template: '%s | Estato - Lucknow Real Estate'
  },
  description: 'Find luxury apartments, independent houses, villas & commercial properties in Lucknow. Explore Gomti Nagar, Hazratganj, Indira Nagar, Aliganj & prime locations. Best property deals in Lucknow with verified listings.',
  keywords: ['Lucknow properties', 'real estate Lucknow', 'apartments Lucknow', 'houses for sale Lucknow', 'rental properties Lucknow', 'Gomti Nagar properties', 'Hazratganj real estate', 'Indira Nagar apartments', 'Aliganj houses', 'Lucknow commercial properties', 'property dealers Lucknow', 'real estate agents Lucknow', 'buy property Lucknow', 'rent apartment Lucknow', 'luxury villas Lucknow', 'independent houses Lucknow', 'property investment Lucknow', 'real estate platform Lucknow'],
  authors: [{ name: 'Estato', url: 'https://estato.com' }],
  creator: 'Estato Real Estate Platform',
  publisher: 'Estato Properties Lucknow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://estato.com'
  },
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Estato - #1 Real Estate Platform in Lucknow | Premium Properties',
    description: 'Discover premium apartments, houses & villas in Lucknow. Best property deals in Gomti Nagar, Hazratganj, Indira Nagar. Verified listings with EMI calculator.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Estato - Lucknow Real Estate',
    url: 'https://estato.com',
    images: [
      {
        url: '/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Estato - Premium Properties in Lucknow'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estato - Premium Properties in Lucknow | Real Estate Platform',
    description: 'Find luxury apartments & houses in Lucknow. Gomti Nagar, Hazratganj, Indira Nagar properties with EMI calculator.',
    images: ['/logo.jpg'],
    creator: '@estato',
    site: '@estato',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'Real Estate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" className="h-full scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#7B2D8E" />
        <meta name="msapplication-TileColor" content="#7B2D8E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Estato" />
        <meta name="application-name" content="Estato" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <StructuredData />
      </head>
      <body className={`${poppins.className} min-h-screen flex flex-col bg-gray-50 text-crisp antialiased`}>
        <DemoBanner />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
