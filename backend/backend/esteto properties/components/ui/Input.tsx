'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#7B2D8E] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7B2D8E]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7B2D8E] focus:border-[#7B2D8E] transition-all duration-200 outline-none bg-white text-gray-900 placeholder-gray-400',
              icon && 'pl-10',
              error && 'border-[#E91E63] focus:ring-[#E91E63]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-[#E91E63]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
