"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue, useScroll, AnimatePresence } from "framer-motion";

// --- Utility ---
// function cn(...inputs: ClassValue[]) {
//     return twMerge(clsx(inputs));
// }

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
    src: string;
    index: number;
    total: number;
    phase: AnimationPhase;
    target: { x: number; y: number; rotation: number; scale: number; opacity: number };
    content: { arabic: string; indo: string; desc: string };
}

// --- FlipCard Component ---
const IMG_WIDTH_MOBILE = 55;
const IMG_HEIGHT_MOBILE = 75;
const IMG_WIDTH_TABLET = 60;
const IMG_HEIGHT_TABLET = 85;
const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({
    src,
    index,
    target,
    content,
}: FlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [cardSize, setCardSize] = useState({ width: IMG_WIDTH, height: IMG_HEIGHT });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setCardSize({ width: IMG_WIDTH_MOBILE, height: IMG_HEIGHT_MOBILE });
            } else if (width < 1024) {
                setCardSize({ width: IMG_WIDTH_TABLET, height: IMG_HEIGHT_TABLET });
            } else {
                setCardSize({ width: IMG_WIDTH, height: IMG_HEIGHT });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <motion.div
            // Smoothly animate to the coordinates defined by the parent
            animate={{
                x: target.x,
                y: target.y,
                rotate: target.rotation,
                scale: target.scale,
                opacity: target.opacity,
            }}
            transition={{
                type: "tween",
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1]
            }}

            // Initial style
            style={{
                position: "absolute",
                width: cardSize.width,
                height: cardSize.height,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="cursor-pointer group select-none"
            onPointerDown={(e) => {
                e.stopPropagation();
                setIsFlipped(!isFlipped);
            }}
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ 
                    duration: 0.05, 
                    ease: "linear"
                }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl ring-1 ring-black/5 bg-transparent"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <img
                        src={src}
                        alt={`hero-${index}`}
                        className="h-full w-full object-cover"
                    />
                    {/* Click hint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1 sm:pb-2">
                        <span className="text-white text-[6px] sm:text-[8px] font-semibold uppercase tracking-wider">
                            Klik
                        </span>
                    </div>
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-lg sm:rounded-xl shadow-md sm:shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex flex-col items-center justify-center p-2 sm:p-3 border border-emerald-500"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className="text-center space-y-0.5 sm:space-y-1">
                        {/* Arabic Text */}
                        <p className="text-[8px] sm:text-[10px] md:text-xs font-bold text-yellow-300 mb-0.5 sm:mb-1" style={{ fontFamily: 'serif' }}>
                            {content.arabic}
                        </p>
                        {/* Indonesian Text */}
                        <p className="text-[7px] sm:text-[8px] md:text-[9px] font-semibold text-white uppercase tracking-wide">
                            {content.indo}
                        </p>
                        {/* Description */}
                        <p className="text-[5px] sm:text-[6px] md:text-[7px] text-emerald-100 leading-tight mt-0.5 sm:mt-1">
                            {content.desc}
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 3500; // Virtual scroll range - increased for smoother transitions

// Card Content Data
const CARD_CONTENT = [
    { arabic: "الشَّفَافِيَّة", indo: "Transparansi", desc: "Laporan keuangan real-time" },
    { arabic: "الأَمَانَة", indo: "Amanah", desc: "Pengelolaan dana terpercaya" },
    { arabic: "الصَّدَقَة", indo: "Sedekah", desc: "Kemudahan berdonasi" },
    { arabic: "البَرَكَة", indo: "Berkah", desc: "Manfaat yang berkelanjutan" },
    { arabic: "التَّعَاوُن", indo: "Gotong Royong", desc: "Bersama membangun masjid" },
    { arabic: "الإِخْلَاص", indo: "Ikhlas", desc: "Niat lillahi ta'ala" },
    { arabic: "التَّقْوَى", indo: "Takwa", desc: "Menjaga kepercayaan umat" },
    { arabic: "الرَّحْمَة", indo: "Rahmat", desc: "Kasih sayang untuk sesama" },
    { arabic: "العِبَادَة", indo: "Ibadah", desc: "Mendekatkan diri kepada Allah" },
    { arabic: "الإِحْسَان", indo: "Ihsan", desc: "Berbuat kebaikan maksimal" },
    { arabic: "التَّوَكُّل", indo: "Tawakal", desc: "Berserah kepada Allah" },
    { arabic: "الصَّبْر", indo: "Sabar", desc: "Istiqomah dalam kebaikan" },
    { arabic: "الشُّكْر", indo: "Syukur", desc: "Bersyukur atas nikmat-Nya" },
    { arabic: "التَّوْبَة", indo: "Taubat", desc: "Kembali kepada jalan-Nya" },
    { arabic: "الدُّعَاء", indo: "Doa", desc: "Memohon ridho Allah" },
    { arabic: "الزَّكَاة", indo: "Zakat", desc: "Membersihkan harta" },
    { arabic: "الإِنْفَاق", indo: "Infaq", desc: "Menafkahkan di jalan Allah" },
    { arabic: "الخَيْر", indo: "Kebaikan", desc: "Berbagi untuk sesama" },
    { arabic: "البِرّ", indo: "Kebajikan", desc: "Amal saleh yang bermanfaat" },
    { arabic: "الهِدَايَة", indo: "Hidayah", desc: "Petunjuk menuju kebenaran" },
];

// Local Images from public/images/scroll
const IMAGES = [
    "/images/scroll/1.webp",
    "/images/scroll/2.webp",
    "/images/scroll/3.webp",
    "/images/scroll/4.webp",
    "/images/scroll/5.webp",
    "/images/scroll/6.webp",
    "/images/scroll/7.webp",
    "/images/scroll/8.webp",
    "/images/scroll/9.webp",
    "/images/scroll/10.webp",
    "/images/scroll/11.webp",
    "/images/scroll/12.webp",
    "/images/scroll/13.webp",
    "/images/scroll/14.webp",
    "/images/scroll/15.webp",
    "/images/scroll/16.webp",
    "/images/scroll/17.webp",
    "/images/scroll/18.webp",
    "/images/scroll/19.webp",
    "/images/scroll/20.webp",
];

// Helper for linear interpolation
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function IntroAnimation() {
    const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isDesktop, setIsDesktop] = useState(true);
    const [sponsorOrder, setSponsorOrder] = useState([0, 1, 2, 3]);
    const containerRef = useRef<HTMLDivElement>(null);
    const pinnedRef = useRef<HTMLDivElement>(null);

    // Sponsor logos data
    const sponsors = [
        { src: "/images/sponsor/alikhlas.webp", alt: "Masjid Al Ikhlas PIK" },
        { src: "/images/sponsor/pondokIT.webp", alt: "Pondok IT" },
        { src: "/images/sponsor/tb.webp", alt: "SMK Taruna Bhakti" },
        { src: "/images/sponsor/ysb.webp", alt: "Yayasan Setia Bhakti" },
    ];

    // Shuffle sponsor positions every 30 seconds
    useEffect(() => {
        const shuffleInterval = setInterval(() => {
            setSponsorOrder(prev => {
                const newOrder = [...prev];
                // Fisher-Yates shuffle
                for (let i = newOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
                }
                return newOrder;
            });
        }, 30000); // 30 seconds

        return () => clearInterval(shuffleInterval);
    }, []);

    // Responsive sizing for all devices
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 768); // Include tablets and mobile
        };
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // --- Container Size ---
    useEffect(() => {
        const targetEl = pinnedRef.current || containerRef.current;
        if (!targetEl) {
            if (typeof window !== "undefined") {
                setContainerSize({ width: window.innerWidth, height: window.innerHeight });
            }
            return;
        }

        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(targetEl);

        // Initial set
        setContainerSize({
            width: (targetEl as HTMLDivElement).offsetWidth,
            height: (targetEl as HTMLDivElement).offsetHeight,
        });

        return () => observer.disconnect();
    }, []);

    // --- Virtual Scroll Logic (sync with page scroll) ---
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });
    const virtualScroll = useTransform(scrollYProgress, [0, 1], [0, MAX_SCROLL]);

    // 1. Morph Progress: 0 (Circle) -> 1 (Bottom Arc)
    // Happens between scroll 0 and 800 (increased for smoother transition)
    const morphProgress = useTransform(virtualScroll, [0, 800], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { 
        stiffness: 120, 
        damping: 20,
        mass: 0.5,
        restDelta: 0.0001,
        restSpeed: 0.0001
    });

    // 2. Scroll Rotation (Shuffling): Starts after morph (e.g., > 800)
    // Rotates the bottom arc as user continues scrolling
    const scrollRotate = useTransform(virtualScroll, [800, 3500], [0, 360]);
    const smoothScrollRotate = useSpring(scrollRotate, { 
        stiffness: 100, 
        damping: 20,
        mass: 0.5,
        restDelta: 0.0001,
        restSpeed: 0.0001
    });

    // --- Mouse Parallax ---
    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { 
        stiffness: 100, 
        damping: 25,
        mass: 0.5,
        restDelta: 0.0001
    });

    useEffect(() => {
        const container = pinnedRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;

            // Normalize -1 to 1
            const normalizedX = (relativeX / rect.width) * 2 - 1;
            // Move +/- 100px
            mouseX.set(normalizedX * 100);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    // --- Intro Sequence ---
    useEffect(() => {
        const timer1 = setTimeout(() => setIntroPhase("line"), 800);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 2000);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // --- Random Scatter Positions ---
    const scatterPositions = useMemo(() => {
        return IMAGES.map(() => ({
            x: (Math.random() - 0.5) * 1500,
            y: (Math.random() - 0.5) * 1000,
            rotation: (Math.random() - 0.5) * 180,
            scale: 0.6,
            opacity: 0,
        }));
    }, []);

    // --- Render Loop (Manual Calculation for Morph) ---
    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
        const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
        const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
        return () => {
            unsubscribeMorph();
            unsubscribeRotate();
            unsubscribeParallax();
        };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    // --- Content Opacity ---
    // Fade in content when arc is formed (morphValue > 0.85)
    const contentOpacity = useTransform(smoothMorph, [0.85, 1], [0, 1]);
    const contentY = useTransform(smoothMorph, [0.85, 1], [30, 0]);

    return (
        <div
            ref={containerRef}
            className="relative h-[500vh] w-full bg-white"
            style={{ overscrollBehavior: "contain" }}
        >
            {/* Pinned viewport */}
            <div ref={pinnedRef} className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center perspective-1000">
                
                {/* Stats Bar - Top */}
                <div className="absolute top-0 left-0 right-0 z-10">
                    {/* Sponsor Logos Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 py-4 md:py-6"
                    >
                        <div className="max-w-7xl mx-auto px-4">
                            {/* Sponsor Label */}
                            <div className="text-center mb-3">
                                <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-widest">
                                    Didukung Oleh
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 divide-x-0 md:divide-x divide-yellow-600">
                                <AnimatePresence mode="popLayout">
                                    {sponsorOrder.map((sponsorIndex, position) => (
                                        <motion.div 
                                            key={`sponsor-${sponsorIndex}`}
                                            layout
                                            initial={{ 
                                                opacity: 0, 
                                                scale: 0.5,
                                                y: -20
                                            }}
                                            animate={{ 
                                                opacity: 1, 
                                                scale: 1,
                                                y: 0
                                            }}
                                            exit={{ 
                                                opacity: 0, 
                                                scale: 0.5,
                                                y: 20
                                            }}
                                            transition={{ 
                                                duration: 0.5, 
                                                delay: position * 0.08,
                                                ease: [0.4, 0, 0.2, 1],
                                                layout: {
                                                    duration: 0.4,
                                                    ease: [0.4, 0, 0.2, 1]
                                                }
                                            }}
                                            className="flex items-center justify-center"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <motion.div 
                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="bg-white rounded-lg p-3 md:p-4 shadow-md hover:shadow-xl transition-shadow duration-300"
                                                >
                                                    <img 
                                                        src={sponsors[sponsorIndex].src} 
                                                        alt={sponsors[sponsorIndex].alt} 
                                                        className="h-10 md:h-12 w-auto object-contain"
                                                    />
                                                </motion.div>
                                                <p className="text-[10px] md:text-xs font-semibold text-gray-800 text-center">
                                                    {sponsors[sponsorIndex].alt}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Marquee Animation */}
                    <motion.div 
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1.5, type: "spring", stiffness: 80, damping: 15 }}
                        className="bg-blue-600 py-1 overflow-hidden"
                    >
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
                        </div>
                    </motion.div>
                </div>


                {/* Intro Text (Fades out) */}
                <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-[60%] md:top-[55%] -translate-y-1/2 px-4 max-w-xs md:max-w-none">
                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 1 }}
                        className="text-base md:text-2xl lg:text-4xl font-medium tracking-tight text-gray-800 leading-tight md:leading-normal"
                    >
                        Wujudkan Transparansi Donasi Masjid
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 0.5 - morphValue } : { opacity: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mt-2 md:mt-4 text-[9px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.2em] text-gray-800"
                    >
                        SCROLL UNTUK MENJELAJAH
                    </motion.p>
                </div>

                {/* Arc Active Content (Fades in) */}
                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="absolute top-[50%] md:top-[30%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
                >
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-semibold text-gray-900 tracking-tight mb-3 md:mb-4">
                        Jelajahi Misi DanaMasjid
                    </h2>
                    <p className="text-xs md:text-sm lg:text-base text-gray-800 max-w-lg leading-relaxed">
                        Transparansi donasi, laporan real-time, dan program yang berdampak. <br className="hidden md:block" />
                        Gulir untuk melihat program unggulan dan fitur yang memudahkan berdonasi.
                    </p>
                </motion.div>

                {/* Main Container */}
                <div className="relative flex items-center justify-center w-full h-full">
                    {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

                        // 1. Intro Phases (Scatter -> Line)
                        if (introPhase === "scatter") {
                            target = scatterPositions[i];
                        } else if (introPhase === "line") {
                            const lineSpacing = 70; // Adjusted for smaller images (60px width + 10px gap)
                            const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                            const lineX = i * lineSpacing - lineTotalWidth / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        } else {
                            // 2. Circle Phase & Morph Logic

                            // Responsive Calculations
                            const isMobile = containerSize.width < 768;
                            const minDimension = Math.min(containerSize.width, containerSize.height);

                            // A. Calculate Circle Position
                            const circleRadius = Math.min(minDimension * 0.35, 350);
                            const circleOffsetY = 120; // Offset ke bawah untuk menghindari stats bar

                            const circleAngle = (i / TOTAL_IMAGES) * 360;
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius + circleOffsetY,
                                rotation: circleAngle + 90,
                            };

                            // B. Calculate Bottom Arc Position
                            // "Rainbow" Arch: Convex up. Center is highest point.

                            // Radius:
                            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                            const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);

                            // Position:
                            const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
                            const arcCenterY = arcApexY + arcRadius;

                            // Spread angle:
                            const spreadAngle = isMobile ? 100 : 130;
                            const startAngle = -90 - (spreadAngle / 2);
                            const step = spreadAngle / (TOTAL_IMAGES - 1);

                            // Apply Scroll Rotation (Shuffle) with Bounds
                            // We want to clamp rotation so images don't disappear.
                            // Map scroll range [600, 3000] to a limited rotation range.
                            // Range: [-spreadAngle/2, spreadAngle/2] keeps them roughly in view.
                            // We map 0 -> 1 (progress of scroll loop) to this range.

                            // Note: rotateValue comes from smoothScrollRotate which maps [600, 3000] -> [0, 360]
                            // We need to adjust that mapping in the hook above, OR adjust it here.
                            // Better to adjust it here relative to the spread.

                            // Let's interpret rotateValue (0 to 360) as a progress 0 to 1
                            const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);

                            // Calculate bounded rotation:
                            // Move from 0 (centered) to -spreadAngle (all the way left) or similar.
                            // Let's allow scrolling through the list.
                            // Total sweep needed to see all items if we start at one end?
                            // If we start centered, we can go +/- spreadAngle/2.

                            // User wants to "stop on the last image".
                            // Let's map scroll to: 0 -> -spreadAngle (shifts items left)
                            const maxRotation = spreadAngle * 0.8; // Don't go all the way, keep last item visible
                            const boundedRotation = -scrollProgress * maxRotation;

                            const currentArcAngle = startAngle + (i * step) + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 1.4 : 1.8, // Increased scale for active state
                            };

                            // C. Skip circle animation, go directly to arc
                            target = {
                                x: arcPos.x,
                                y: arcPos.y,
                                rotation: arcPos.rotation,
                                scale: arcPos.scale,
                                opacity: 1,
                            };
                        }
                        return (
                            <FlipCard
                                key={i}
                                src={src}
                                index={i}
                                total={TOTAL_IMAGES}
                                phase={introPhase}
                                target={target}
                                content={CARD_CONTENT[i]}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}