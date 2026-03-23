"use client";

import { memo, useState, useEffect, useRef } from "react";
import { markPageLoadingDone } from "@/lib/page-loading-done";

// Optimized Lottie player with aggressive timeout for fast fallback
const LottiePlayer = memo(function LottiePlayer() {
  const [LottieComponent, setLottieComponent] = useState<any>(null);
  const [animationData, setAnimationData] = useState<any>(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const loadedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    // Ultra aggressive timeout - show spinner very quickly
    timeoutRef.current = setTimeout(() => {
      if (!LottieComponent || !animationData) {
        setShowSpinner(true);
      }
    }, 150); // Only wait 150ms for Lottie!

    const load = async () => {
      try {
        // Check cache first for instant load
        const cached = sessionStorage.getItem('lottie-animation-data');
        
        const [lottieModule, animData] = await Promise.all([
          import("lottie-react"),
          cached 
            ? Promise.resolve(JSON.parse(cached))
            : fetch("/lotie-loading.json").then(async (r) => {
                const data = await r.json();
                // Cache for session
                try {
                  sessionStorage.setItem('lottie-animation-data', JSON.stringify(data));
                } catch (e) {
                  // Ignore quota errors
                }
                return data;
              }),
        ]);
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setLottieComponent(() => lottieModule.default);
        setAnimationData(animData);
      } catch (e) {
        console.error("Failed to load Lottie:", e);
        setShowSpinner(true);
      }
    };
    load();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [LottieComponent, animationData]);

  // Show spinner if loading takes too long OR not ready yet
  if (showSpinner || !LottieComponent || !animationData) {
    return (
      <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
        <div className="relative w-24 h-24">
          {/* Outer golden ring */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-spin" 
               style={{ 
                 borderTopColor: '#F59E0B',
                 borderRightColor: '#FBBF24',
                 animationDuration: '1.2s'
               }}>
          </div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 animate-pulse"
               style={{ animationDuration: '1.5s' }}>
          </div>
          
          {/* Center mosque image - smaller */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <img 
              src="/images/loading/mosque.webp" 
              alt="Mosque"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-32 h-32 md:w-40 md:h-40">
      <LottieComponent
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
        rendererSettings={{ 
          preserveAspectRatio: "xMidYMid slice", 
          progressiveLoad: true,
          hideOnTransparent: true,
          clearCanvas: true
        }}
      />
    </div>
  );
});

interface LottieLoadingProps {
  className?: string;
  initialLoad?: boolean;
}

export const LottieLoading = memo(function LottieLoading({
  className = "h-screen bg-white flex items-center justify-center",
  initialLoad = false,
}: LottieLoadingProps) {
  const [mounted, setMounted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(true);
  const timersRef = useRef<{ fade?: NodeJS.Timeout; hide?: NodeJS.Timeout }>({});

  useEffect(() => {
    if (!initialLoad) return;
    setMounted(true);
    document.body.classList.add("loading-active");

    // Ultra fast fade out - maximum speed
    timersRef.current.fade = setTimeout(() => setFadeOut(true), 500);
    timersRef.current.hide = setTimeout(() => {
      setVisible(false);
      document.body.classList.remove("loading-active");
      document.getElementById("initial-loader-style")?.remove();
      markPageLoadingDone();
    }, 700);

    return () => {
      if (timersRef.current.fade) clearTimeout(timersRef.current.fade);
      if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
    };
  }, [initialLoad]);

  if (initialLoad) {
    if (!mounted || !visible) return null;
    return (
      <div
        id="initial-loader-overlay"
        className="fixed inset-0 z-[99999] bg-white flex items-center justify-center transition-opacity duration-150"
        style={{ 
          opacity: fadeOut ? 0 : 1, 
          pointerEvents: fadeOut ? "none" : "all",
          willChange: fadeOut ? "opacity" : "auto"
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <LottiePlayer />
          <div className="text-gray-600 text-center">
            <div className="text-lg font-semibold">Loading...</div>
            <div className="text-sm mt-1">Memuat konten...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-3">
        <LottiePlayer />
        <div className="text-gray-600 text-center">
          <div className="text-lg font-semibold">Loading...</div>
          <div className="text-sm mt-1">Memuat konten...</div>
        </div>
      </div>
    </div>
  );
});
