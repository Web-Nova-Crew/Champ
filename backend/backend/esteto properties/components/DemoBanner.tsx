'use client'

import { shouldUseMockData } from '@/lib/mock-api'
import { AlertCircle } from 'lucide-react'

export default function DemoBanner() {
  const isDemo = shouldUseMockData()

  if (!isDemo) return null

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 py-2">
      <div className="container-custom">
        <div className="flex items-center justify-center gap-2 text-sm text-yellow-800">
          <AlertCircle className="w-4 h-4" />
          <span>
            <strong>Demo Mode:</strong> Running with mock data. Configure Supabase to enable full functionality.
          </span>
        </div>
      </div>
    </div>
  )
}
