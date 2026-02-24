'use client'

interface PropertyMapProps {
  lat: number
  lng: number
  title: string
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  // Use OpenStreetMap embed (free, no API key required)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <iframe
      src={mapUrl}
      title={`Map showing ${title}`}
      className="w-full h-96 rounded-lg border border-gray-200"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
