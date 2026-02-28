"use client"

import { useEffect } from 'react'
import { initializeSecurity } from '@/lib/advanced-security'

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize all security measures on mount
    initializeSecurity()
  }, [])

  return <>{children}</>
}
