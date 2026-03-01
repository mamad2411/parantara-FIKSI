import { Header } from "@/components/layout"
import { HeroSection } from "@/components/sections"
import { StatsSection } from "@/components/sections"
import { ServicesSection } from "@/components/sections"
import { FeaturesSection } from "@/components/sections"
import { DonationProgramsSection } from "@/components/sections"
import { TestimonialsSection } from "@/components/sections"
import { FAQSection } from "@/components/sections"
import { CTASection } from "@/components/sections"
import { Footer } from "@/components/layout"
import IntroAnimation from "@/components/scroll-morph-hero"
import { HomePage as ScrollingAnimation } from "@/components/scrolling-animation"
 
 

const parallaxImages = [
  { src: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=2070&auto=format&fit=crop", alt: "Masjid Dome" },
  { src: "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1964&auto=format&fit=crop", alt: "Image 2" },
  { src: "https://images.unsplash.com/photo-1605106715994-18d3fecffb98?q=80&w=1887&auto=format&fit=crop", alt: "Image 3" },
  { src: "https://images.unsplash.com/photo-1605106250963-ffda6d2a4b32?q=80&w=1887&auto=format&fit=crop", alt: "Image 4" },
  { src: "https://images.unsplash.com/photo-1605106702842-01a887a31122?q=80&w=1887&auto=format&fit=crop", alt: "Image 5" },
  { src: "https://images.unsplash.com/photo-1605106901227-991bd663255c?q=80&w=1887&auto=format&fit=crop", alt: "Image 6" },
  { src: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=2070&auto=format&fit=crop", alt: "Masjid Interior" },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <FeaturesSection />
      <CTASection />
      <IntroAnimation />
      <ScrollingAnimation />
      <DonationProgramsSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
