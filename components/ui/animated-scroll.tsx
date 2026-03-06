'use client'

import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

const pages = [
  {
    leftBgImage: 'https://images.unsplash.com/photo-1748968218568-a5eac621e65c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1M3x8fGVufDB8fHx8fA%3D%3D',
    rightBgImage: null,
    leftContent: null,
    rightContent: {
      heading: 'Transparansi Donasi',
      description: 'Laporan keuangan real-time untuk setiap donasi',
    },
  },
  {
    leftBgImage: null,
    rightBgImage: 'https://images.unsplash.com/photo-1749315099905-9cf6cabd9126?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Nnx8fGVufDB8fHx8fA%3D%3D',
    leftContent: {
      heading: 'Mudah & Aman',
      description: 'Platform donasi yang mudah digunakan dan terpercaya',
    },
    rightContent: null,
  },
  {
    leftBgImage: 'https://images.unsplash.com/photo-1747893541442-a139096ea39c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMzZ8fHxlbnwwfHx8fHw%3D',
    rightBgImage: null,
    leftContent: null,
    rightContent: {
      heading: 'Program Berkah',
      description: 'Berbagai program donasi untuk kemajuan masjid',
    },
  },
  {
    leftBgImage: null,
    rightBgImage: 'https://images.unsplash.com/photo-1748164521179-ae3b61c6dd90?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMjR8fHxlbnwwfHx8fHw%3D',
    leftContent: {
      heading: 'Komunitas',
      description: 'Bergabung dengan ribuan donatur di seluruh Indonesia',
    },
    rightContent: null,
  },
  {
    leftBgImage: 'https://images.unsplash.com/photo-1742626157052-f5a373a727ef?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMnx8fGVufDB8fHx8fA%3D%3D',
    rightBgImage: null,
    leftContent: null,
    rightContent: {
      heading: 'Mari Berdonasi!',
      description: 'Mulai berbagi kebaikan hari ini',
    },
  },
];

export default function ScrollAdventure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const numOfPages = pages.length;

  // Track scroll progress through this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  return (
    <div ref={containerRef} className="relative bg-black" style={{ height: `${numOfPages * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {pages.map((page, i) => {
          // Calculate when each page should be visible
          const pageStart = i / numOfPages;
          const pageEnd = (i + 1) / numOfPages;
          
          // Left side: slides from bottom to center to top
          const leftY = useTransform(
            scrollYProgress,
            [pageStart, (pageStart + pageEnd) / 2, pageEnd],
            ['100%', '0%', '-100%']
          );
          
          // Right side: slides from top to center to bottom
          const rightY = useTransform(
            scrollYProgress,
            [pageStart, (pageStart + pageEnd) / 2, pageEnd],
            ['-100%', '0%', '100%']
          );
          
          // Opacity for smooth fade in/out
          const opacity = useTransform(
            scrollYProgress,
            [
              Math.max(0, pageStart - 0.05),
              pageStart,
              pageEnd,
              Math.min(1, pageEnd + 0.05)
            ],
            [0, 1, 1, 0]
          );

          return (
            <div key={i} className="absolute inset-0">
              {/* Left Half */}
              <motion.div
                className="absolute top-0 left-0 w-1/2 h-full"
                style={{ y: leftY, opacity }}
              >
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ 
                    backgroundImage: page.leftBgImage ? `url(${page.leftBgImage})` : undefined,
                    backgroundColor: page.leftBgImage ? undefined : '#1a1a1a'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white p-4 md:p-8">
                    {page.leftContent && (
                      <>
                        <h2 className="text-xl md:text-2xl lg:text-3xl uppercase mb-2 md:mb-4 text-center font-bold">
                          {page.leftContent.heading}
                        </h2>
                        <p className="text-sm md:text-base lg:text-lg text-center max-w-md">
                          {page.leftContent.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Right Half */}
              <motion.div
                className="absolute top-0 left-1/2 w-1/2 h-full"
                style={{ y: rightY, opacity }}
              >
                <div
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ 
                    backgroundImage: page.rightBgImage ? `url(${page.rightBgImage})` : undefined,
                    backgroundColor: page.rightBgImage ? undefined : '#1a1a1a'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white p-4 md:p-8">
                    {page.rightContent && (
                      <>
                        <h2 className="text-xl md:text-2xl lg:text-3xl uppercase mb-2 md:mb-4 text-center font-bold">
                          {page.rightContent.heading}
                        </h2>
                        {typeof page.rightContent.description === 'string' ? (
                          <p className="text-sm md:text-base lg:text-lg text-center max-w-md">
                            {page.rightContent.description}
                          </p>
                        ) : (
                          <div className="text-sm md:text-base lg:text-lg text-center max-w-md">
                            {page.rightContent.description}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Page Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {pages.map((_, i) => {
            const pageStart = i / numOfPages;
            const pageEnd = (i + 1) / numOfPages;
            
            const dotWidth = useTransform(
              scrollYProgress,
              [pageStart, (pageStart + pageEnd) / 2, pageEnd],
              [8, 32, 8]
            );
            
            const dotOpacity = useTransform(
              scrollYProgress,
              [
                Math.max(0, pageStart - 0.05),
                pageStart,
                pageEnd,
                Math.min(1, pageEnd + 0.05)
              ],
              [0.5, 1, 1, 0.5]
            );

            return (
              <motion.div
                key={i}
                className="h-2 rounded-full bg-white"
                style={{ width: dotWidth, opacity: dotOpacity }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
