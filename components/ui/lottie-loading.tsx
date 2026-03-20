"use client";

import { memo, useState, useEffect } from "react";

// Lottie player — shows nothing until animation data is ready
const LottiePlayer = memo(function LottiePlayer() {
  const [LottieComponent, setLottieComponent] = useState<any>(null);
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [lottieModule, animData] = await Promise.all([
          import("lottie-react"),
          fetch("/lotie-loading.json").then((r) => r.json()),
        ]);
        setLottieComponent(() => lottieModule.default);
        setAnimationData(animData);
      } catch (e) {
        console.error("Failed to load Lottie:", e);
      }
    };
    load();
  }, []);

  // Nothing shown until Lottie is ready — no spinner fallback
  if (!LottieComponent || !animationData) return <div className="w-32 h-32 md:w-40 md:h-40" />;

  return (
    <div className="w-32 h-32 md:w-40 md:h-40">
      <LottieComponent
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
        rendererSettings={{ preserveAspectRatio: "xMidYMid slice", progressiveLoad: true }}
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

  useEffect(() => {
    if (!initialLoad) return;
    setMounted(true);
    document.body.classList.add("loading-active");

    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      document.body.classList.remove("loading-active");
      document.getElementById("initial-loader-style")?.remove();
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [initialLoad]);

  if (initialLoad) {
    if (!mounted || !visible) return null;
    return (
      <div
        id="initial-loader-overlay"
        className="fixed inset-0 z-[99999] bg-white flex items-center justify-center transition-opacity duration-500"
        style={{ opacity: fadeOut ? 0 : 1, pointerEvents: fadeOut ? "none" : "all" }}
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
