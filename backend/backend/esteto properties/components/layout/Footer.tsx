import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container-custom">
        {/* Company Info */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-white px-3 py-2 rounded-xl font-bold text-xl" style={{ backgroundColor: '#7B2D8E' }}>
              E
            </div>
            <div>
              <span className="text-white text-xl font-bold">Estato</span>
              <span className="text-gray-400 text-sm block">Lucknow Real Estate</span>
            </div>
          </div>
          <p className="text-gray-400 mb-4 max-w-2xl mx-auto">
            Lucknow&apos;s premier real estate platform for buying, selling, and renting properties.
          </p>
        </div>
        
        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/properties" className="text-gray-400 hover:text-white transition-colors">Properties</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          
          {/* Property Types */}
          <div>
            <h4 className="text-white font-semibold mb-4">Property Types</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/properties?type=apartment" className="text-gray-400 hover:text-white transition-colors">Apartments</Link></li>
              <li><Link href="/properties?type=house" className="text-gray-400 hover:text-white transition-colors">Houses</Link></li>
              <li><Link href="/properties?type=villa" className="text-gray-400 hover:text-white transition-colors">Villas</Link></li>
              <li><Link href="/properties?type=office" className="text-gray-400 hover:text-white transition-colors">Offices</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Email: info@estato.com</p>
              <p>Phone: +91 98765 43210</p>
              <p>Gomti Nagar, Lucknow</p>
              <p>Uttar Pradesh, India</p>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Estato Properties. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
