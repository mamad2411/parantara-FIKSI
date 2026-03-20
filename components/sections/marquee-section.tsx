"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AnimatedSection } from "@/components/animations/animated-section";

interface MarqueeSectionProps {
  sponsors: Array<{
    src: string;
    alt: string;
  }>;
  sponsorOrder: number[];
}

export function MarqueeSection({ sponsors, sponsorOrder }: MarqueeSectionProps) {
  return (
    <div className="w-full overflow-hidden">
      {/* Sponsor Logos Bar */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-3">
            <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-widest">
              Didukung Oleh
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 divide-x-0 md:divide-x divide-yellow-600">
            {sponsorOrder.map((sponsorIndex, position) => (
              <div 
                key={`sponsor-${sponsorIndex}`}
                className="flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white rounded-lg p-2 md:p-3 shadow-md hover:shadow-xl transition-shadow duration-300">
                    <Image
                      src={sponsors[sponsorIndex].src}
                      alt={sponsors[sponsorIndex].alt}
                      width={80}
                      height={32}
                      className="h-6 md:h-8 object-contain"
                      loading="lazy"
                      sizes="(max-width: 768px) 60px, 80px"
                    />
                  </div>
                  <p className="text-[10px] md:text-xs font-semibold text-gray-800 text-center">
                    {sponsors[sponsorIndex].alt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Marquee Animation */}
      <div className="bg-blue-600 py-1 overflow-hidden">
        <div className="flex animate-marquee-infinite whitespace-nowrap">
          <span className="text-xs text-white mx-6">Platform Donasi Masjid Terpercaya</span>
          <span className="text-xs text-white">|</span>
          <span className="text-xs text-white mx-6">Transparansi Real-Time</span>
          <span className="text-xs text-white">|</span>
          <span className="text-xs text-white mx-6">Amanah & Berkah</span>
          <span className="text-xs text-white">|</span>
          <span className="text-xs text-white mx-6">Laporan Lengkap</span>
          <span className="text-xs text-white">|</span>
          <span className="text-xs text-white mx-6">Mudah & Aman</span>
          <span className="text-xs text-white">|</span>
          <span className="text-xs text-white mx-6">Sesuai Syariah</span>
          <span className="text-xs text-white">|</span>
          <span className="text-xs text-white mx-6">Donasi Digital Terpercaya</span>
          <span className="text-xs text-white">|</span>
        </div>
      </div>
    </div>
  );
}