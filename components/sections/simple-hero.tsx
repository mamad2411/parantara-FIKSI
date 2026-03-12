"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ReactNode } from "react"

interface SimpleHeroProps {
  title: ReactNode
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  secondaryCtaText?: string
  secondaryCtaHref?: string
  className?: string
}

export function SimpleHero({
  title,
  subtitle,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  className = ""
}: SimpleHeroProps) {
  return (
    <section className={`relative py-20 md:py-32 px-4 ${className}`}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            {title}
          </h1>
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              {subtitle}
            </motion.p>
          )}

          {(ctaText || secondaryCtaText) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {ctaText && ctaHref && (
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors uppercase tracking-wide"
                >
                  {ctaText}
                </Link>
              )}
              
              {secondaryCtaText && secondaryCtaHref && (
                <div className="text-base">
                  {secondaryCtaText}{" "}
                  <Link
                    href={secondaryCtaHref}
                    className="text-blue-600 underline hover:text-blue-700 transition-colors"
                  >
                    Log in
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
