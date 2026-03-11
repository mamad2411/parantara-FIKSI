"use client"

import { useEffect } from 'react'

export function TrustedTypesSetup() {
  useEffect(() => {
    // Set up Trusted Types policy for better XSS protection
    if (typeof window !== 'undefined' && 'trustedTypes' in window) {
      try {
        // Create a default policy for handling dynamic content
        const trustedTypes = (window as any).trustedTypes;
        const policy = trustedTypes?.createPolicy('default', {
          createHTML: (string: string) => {
            // Sanitize HTML content - only allow safe tags
            const allowedTags = ['b', 'i', 'em', 'strong', 'span', 'div', 'p', 'br']
            const sanitized = string.replace(/<(?!\/?(?:b|i|em|strong|span|div|p|br)\b)[^>]*>/gi, '')
            return sanitized
          },
          createScript: (string: string) => {
            // Only allow specific safe scripts
            if (string.includes('gtag') || string.includes('recaptcha') || string.includes('firebase')) {
              return string
            }
            return ''
          },
          createScriptURL: (string: string) => {
            // Only allow trusted script URLs
            const trustedDomains = [
              'https://www.googletagmanager.com',
              'https://www.google-analytics.com',
              'https://www.gstatic.com',
              'https://apis.google.com',
              'https://www.recaptcha.net'
            ]
            
            if (trustedDomains.some(domain => string.startsWith(domain))) {
              return string
            }
            
            // Allow same-origin scripts
            if (string.startsWith('/') || string.startsWith(window.location.origin)) {
              return string
            }
            
            return ''
          }
        })
        
        console.log('Trusted Types policy created successfully')
      } catch (error) {
        console.warn('Failed to create Trusted Types policy:', error)
      }
    }
  }, [])

  return null
}