"use client"

import { useEffect } from 'react'

export function DeferCSS() {
  useEffect(() => {
    // Defer non-critical CSS loading
    const links = document.querySelectorAll('link[rel="stylesheet"]')
    links.forEach((link) => {
      const href = link.getAttribute('href')
      if (href && !href.includes('critical')) {
        link.setAttribute('media', 'print')
        link.setAttribute('onload', "this.media='all'")
      }
    })
  }, [])

  return null
}
