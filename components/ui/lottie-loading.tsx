"use client";

import { memo, Suspense, useState, useEffect } from "react";

// Minimal loading fallback — shown while lottie-react loads (~300ms)
const LoadingFallback = memo(function LoadingFallback() {
  return (
    <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
      <svg className="animate-spin w-12 h-12 text-yellow-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
});

// Ultra-lazy Lottie loader - only loads when actually needed
const LottiePlayer = memo(function LottiePlayer() {
  const [LottieComponent, setLottieComponent] = useState<any>(null);
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // Only load Lottie when component mounts
    const loadLottie = async () => {
      try {
        const [lottieModule, animData] = await Promise.all([
          import("lottie-react"),
          fetch("/lotie-loading.json").then((r) => r.json())
        ]);
        
        setLottieComponent(() => lottieModule.default);
        setAnimationData(animData);
      } catch (error) {
        console.error('Failed to load Lottie:', error);
      }
    };

    loadLottie();
  }, []);

  if (!LottieComponent || !animationData) {
    return <LoadingFallback />;
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
        }}
      />
    </div>
  );
});

interface LottieLoadingProps {
  className?: string;
  initialLoad?: boolean; // When true, renders as fixed overlay that auto-dismisses
}

export const LottieLoading = memo(function LottieLoading({ 
  className = "h-screen bg-white flex items-center justify-center",
  initialLoad = false,
}: LottieLoadingProps) {
  const [mounted, setMounted] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!initialLoad) return
    setMounted(true)
    // Add class to body to hide other content
    document.body.classList.add('loading-active')

    const fadeTimer = setTimeout(() => setFadeOut(true), 1800)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      // Reveal page content
      document.body.classList.remove('loading-active')
      const style = document.getElementById('initial-loader-style')
      if (style) style.remove()
    }, 2300)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [initialLoad])

  if (initialLoad) {
    if (!mounted || !visible) return null
    return (
      <div
        id="initial-loader-overlay"
        className="fixed inset-0 z-[99999] bg-white flex items-center justify-center transition-opacity duration-500"
        style={{ opacity: fadeOut ? 0 : 1, pointerEvents: fadeOut ? "none" : "all" }}
      >
        <div className="flex flex-col items-center gap-4">
          <Suspense fallback={<LoadingFallback />}>
            <LottiePlayer />
          </Suspense>
          <div className="text-gray-600 text-center">
            <div className="text-lg font-semibold">Loading...</div>
            <div className="text-sm mt-1">Memuat konten...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        <Suspense fallback={<LoadingFallback />}>
          <LottiePlayer />
        </Suspense>
        <div className="text-gray-600 text-center">
          <div className="text-lg font-semibold">Loading...</div>
          <div className="text-sm mt-1">Memuat konten...</div>
        </div>
      </div>
    </div>
  );
});