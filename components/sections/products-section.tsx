"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";

interface ProductPanelProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  ctaId: string;
  imageSrc: string;
  imageAlt: string;
  features: Array<{
    icon?: React.ReactNode;
    text: string;
    subtext?: string;
  }>;
  disclaimer?: string;
  bgImage?: string;
}

// Inline SVG with legacy icon markup was replaced with Lucide for smaller bundle and a11y.
const CheckIcon = memo(function CheckIcon() {
  return <CheckCircle2 className="shrink-0 size-6" aria-hidden />;
});

// Product Panel Component - Memoized for better performance
const ProductPanel = memo(function ProductPanel({ 
  title, 
  description, 
  ctaText, 
  ctaLink, 
  ctaId,
  imageSrc, 
  imageAlt,
  features,
  disclaimer,
  bgImage = "/_astro/textured-bg.COoSNnYW.webp"
}: ProductPanelProps) {
  return (
    <div className="grid h-full w-full grid-cols-1 lg:grid-cols-2 rounded-3xl bg-white overflow-hidden shadow-xl">
      <div className="flex w-full flex-col justify-between px-6 sm:px-8 md:px-10 py-8 md:py-10">
        <div className="max-w-[250px] md:max-w-[330px]">
          <h4 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            {title}
          </h4>
          <p className="text-base md:text-lg text-gray-900 mt-4">
            {description}
          </p>
          <Link
            href={ctaLink}
            className="inline-flex h-max cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-6 py-4 uppercase transition-colors bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold my-6 md:my-8"
            id={ctaId}
          >
            {ctaText}
          </Link>
        </div>

        <div className="text-gray-900 flex flex-col gap-4">
          {features.map((feature, index) => (
            <div key={index} className={`flex gap-6 ${feature.subtext ? 'items-start' : 'items-center'}`}>
              {feature.icon || <CheckIcon />}
              <p className="text-base md:text-lg flex flex-col">
                <span dangerouslySetInnerHTML={{ __html: feature.text }} />
                {feature.subtext && (
                  <span className="text-xs">{feature.subtext}</span>
                )}
              </p>
            </div>
          ))}
          {disclaimer && (
            <p className="text-xs text-gray-600">{disclaimer}</p>
          )}
        </div>
      </div>

      <div className="relative h-full w-full p-2">
        <div 
          className="bg-yellow-400 flex h-full w-full items-center rounded-3xl bg-cover bg-no-repeat object-cover p-8"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="mx-auto w-full shrink max-w-[clamp(175px,20vh,271px)] lg:max-w-[350px]">
            <Image
              alt={imageAlt}
              src={imageSrc}
              width={271}
              height={271}
              className="w-full h-auto object-contain"
              priority={false}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

interface ProductsSectionProps {
  activeProduct: number;
  setActiveProduct: (index: number) => void;
  hasCompletedAnimation: boolean;
  setHasCompletedAnimation: (completed: boolean) => void;
  productsRef: React.RefObject<HTMLDivElement>;
  isMobile?: boolean;
}

export const ProductsSection = memo(function ProductsSection({ 
  activeProduct, 
  setActiveProduct, 
  hasCompletedAnimation, 
  setHasCompletedAnimation,
  productsRef,
  isMobile = false
}: ProductsSectionProps) {
  // Memoize product data to prevent re-creation
  const products = useMemo(() => [
    {
      title: "Donasi Rutin",
      description: "Program donasi bulanan untuk operasional masjid",
      ctaText: "Mulai Donasi",
      ctaLink: "/donasi/rutin",
      ctaId: "donasiRutinCta",
      imageSrc: "/images/donasi-rutin.webp",
      imageAlt: "Donasi Rutin Masjid",
      features: [
        { text: "Mulai dari Rp 50.000/bulan", subtext: "Dapat disesuaikan dengan kemampuan" },
        { text: "Laporan transparan setiap bulan" },
        { text: "Pahala mengalir terus menerus" }
      ]
    },
    {
      title: "Wakaf Produktif",
      description: "Investasi akhirat melalui wakaf yang berkelanjutan",
      ctaText: "Wakaf Sekarang",
      ctaLink: "/wakaf/produktif",
      ctaId: "wakafProduktifCta",
      imageSrc: "/images/wakaf-produktif.webp",
      imageAlt: "Wakaf Produktif",
      features: [
        { text: "Wakaf mulai Rp 1.000.000", subtext: "Hasil wakaf untuk operasional masjid" },
        { text: "Sertifikat wakaf resmi" },
        { text: "Laporan penggunaan dana berkala" }
      ],
      disclaimer: "Dikelola oleh Badan Wakaf Indonesia (BWI)"
    }
  ], []);

  // Optimize button click handler with useCallback
  const handleProductClick = useCallback((index: number) => {
    setActiveProduct(index);
    
    // If clicking last product (index 1), mark animation as complete
    if (index === 1) {
      setHasCompletedAnimation(true);
    }
  }, [setActiveProduct, setHasCompletedAnimation]);

  return (
    <div ref={productsRef} className={`py-12 lg:py-16 ${isMobile ? 'min-h-fit' : 'min-h-[250vh]'} flex items-end`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sticky bottom-10 w-full">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="flex flex-col gap-4 mb-10"
        >
          <h2 className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-wider">
            Program Kami
          </h2>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 max-w-[517px]">
            Berdonasi untuk kemajuan umat Islam
          </h3>
          <p className="text-base md:text-lg text-gray-900">
            Mudah, transparan, dan penuh berkah.
          </p>
        </motion.div>

        {/* Product Tabs - Desktop */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4 }}
          className="hidden lg:flex h-max flex-row items-center justify-between rounded-full bg-white p-2 max-w-[560px] ml-auto mb-8"
        >
          {products.map((product, index) => (
            <button
              key={index}
              onClick={() => handleProductClick(index)}
              className="cursor-pointer rounded-full px-6 py-3 relative"
            >
              <span className={`cta-lg relative z-10 ${activeProduct === index ? 'text-gray-900' : 'text-gray-500'}`}>
                {product.title}
              </span>
              {activeProduct === index && (
                <motion.div
                  layoutId="activeProductTab"
                  className="bg-gray-300 absolute inset-0 z-0 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Product Panels */}
        <div className="mt-6 lg:mt-10">
          {/* Desktop - Animated Panel */}
          <div className="hidden lg:block min-h-[600px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <ProductPanel {...products[activeProduct]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile - Stacked Panels */}
          <div className="lg:hidden space-y-8">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductPanel {...product} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});