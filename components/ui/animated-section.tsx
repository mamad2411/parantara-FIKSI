"use client"

import { motion, type Variants } from "framer-motion"
import { ReactNode } from "react"

// Variasi animasi yang berbeda
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

export const scaleInRotate: Variants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -10 },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
}

export const flipIn: Variants = {
  hidden: { opacity: 0, rotateY: -90 },
  visible: { 
    opacity: 1, 
    rotateY: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
}

export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.34, 1.56, 0.64, 1] // Bounce easing
    }
  }
}

export const slideInBlur: Variants = {
  hidden: { opacity: 0, x: -40, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut" }
  }
}

export const zoomInRotate: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: 180 },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
}

// Container untuk stagger children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
}

export const staggerFastContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0
    }
  }
}

// Item untuk stagger
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
}

interface AnimatedSectionProps {
  children: ReactNode
  variant?: "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn" | "scaleInRotate" | "flipIn" | "bounceIn" | "slideInBlur" | "zoomInRotate"
  delay?: number
  className?: string
  once?: boolean
  id?: string
}

const variantMap = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInRotate,
  flipIn,
  bounceIn,
  slideInBlur,
  zoomInRotate
}

export function AnimatedSection({ 
  children, 
  variant = "fadeInUp", 
  delay = 0,
  className = "",
  once = true,
  id,
}: AnimatedSectionProps) {
  const selectedVariant = variantMap[variant]
  
  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={selectedVariant}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  fast?: boolean
  once?: boolean
}

export function StaggerContainer({ children, className = "", fast = false, once = true }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      variants={fast ? staggerFastContainer : staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}
