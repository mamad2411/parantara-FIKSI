'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallback?: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  fallback = '/images/placeholder.webp',
  className,
  ...props 
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={`${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setImgSrc(fallback)
        setIsLoading(false)
      }}
      loading="lazy"
      quality={85}
    />
  )
}
