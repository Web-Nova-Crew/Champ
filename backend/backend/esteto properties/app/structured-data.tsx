export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Estato - Lucknow Real Estate",
    "description": "Lucknow's premier real estate platform for premium apartments, houses, villas & commercial properties",
    "url": "https://estato.com",
    "logo": "https://estato.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lucknow",
      "addressRegion": "Uttar Pradesh",
      "addressCountry": "IN"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Lucknow",
        "sameAs": "https://en.wikipedia.org/wiki/Lucknow"
      }
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 26.8467,
        "longitude": 80.9462
      },
      "geoRadius": "50000"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9876543210",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://facebook.com/estato",
      "https://twitter.com/estato",
      "https://instagram.com/estato"
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Estato - Lucknow Real Estate Platform",
    "url": "https://estato.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://estato.com/properties?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Estato Real Estate Lucknow",
    "image": "https://estato.com/og-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gomti Nagar",
      "addressLocality": "Lucknow",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "226010",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.8467,
      "longitude": 80.9462
    },
    "telephone": "+91-9876543210",
    "priceRange": "₹₹₹",
    "openingHours": "Mo-Su 09:00-21:00",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
    </>
  )
}
