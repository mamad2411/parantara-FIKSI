"use client"

import { motion, type Variants } from "framer-motion"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  id?: string
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scaleIn" | "staggerChildren" | "bounceIn" | "flipIn" | "slideRotate" | "morphIn" | "elasticIn" | "waveIn"
  delay?: number
  duration?: number
  threshold?: number
}

const animationVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  staggerChildren: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  },
  bounceIn: {
    hidden: { opacity: 0, scale: 0.3, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 20 }
    }
  },
  flipIn: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 }
  },
  slideRotate: {
    hidden: { opacity: 0, x: -100, rotate: -15 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 12 }
    }
  },
  morphIn: {
    hidden: { opacity: 0, scale: 0.5, borderRadius: "50%" },
    visible: {
      opacity: 1,
      scale: 1,
      borderRadius: "0%",
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  elasticIn: {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 25 }
    }
  },
  waveIn: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 150, damping: 20 }
    }
  }
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function AnimatedSection({
  children,
  className = "",
  id,
  animation = "slideUp",
  delay = 0,
  duration = 0.6,
  threshold = 0.1
}: AnimatedSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    triggerOnce: true
  })

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isIntersecting ? "visible" : "hidden"}
      variants={animationVariants[animation]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {animation === "staggerChildren" ? (
        <motion.div variants={animationVariants.staggerChildren}>
          {Array.isArray(children) ? 
            children.map((child, index) => (
              <motion.div key={index} variants={childVariants}>
                {child}
              </motion.div>
            )) : 
            <motion.div variants={childVariants}>
              {children}
            </motion.div>
          }
        </motion.div>
      ) : (
        children
      )}
    </motion.section>
  )
}