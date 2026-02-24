"use client"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section-2"
import { TeamInfoSection } from "@/components/team-info-section"
import { TeamMembersSection } from "@/components/team-members-section"
import { motion } from "framer-motion"

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Spacing for fixed header */}
      <div className="h-24" />

      {/* Hero Section */}
      <HeroSection
        title={
          <>
            Kenali <span className="text-primary">Tim</span> <span className="relative inline-block">
              <span className="relative z-10 text-white px-2">HidupTebe</span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 -z-0"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </>
        }
        subtitle="Bersama membangun platform donasi masjid yang transparan, amanah, dan terpercaya untuk kemakmuran masjid di seluruh Indonesia."
        callToAction={{
          text: "LIHAT TIM →",
          href: "#team",
        }}
        backgroundImage="/images/hero/sky2.jpeg"
        rightImage="/images/tim/heroo.png"
        contactInfo={{
          website: "",
          phone: "",
          address: "",
        }}
      />

      {/* Team Info Section */}
      <TeamInfoSection />

      {/* Team Members Section */}
      <TeamMembersSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
