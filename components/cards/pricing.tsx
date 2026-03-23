"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const switchContainerRef = useRef<HTMLDivElement>(null);

  // Check if desktop on mount
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      // Stop all confetti animations when component unmounts
      confetti.reset();
    };
  }, []);

  const fireConfetti = () => {
    console.log('🎉 Firing confetti!');
    
    // Get switch position for confetti origin
    const rect = switchContainerRef.current?.getBoundingClientRect();
    if (!rect) {
      console.log('❌ No rect found');
      return;
    }
    
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    console.log('📍 Confetti origin:', { x, y });

    // Fire multiple bursts with different colors
    const colors = [
      ['#FFD700', '#FFA500', '#FF6347'], // Gold, Orange, Red
      ['#3b82f6', '#60a5fa', '#93c5fd'], // Blue shades
      ['#fbbf24', '#f59e0b', '#eab308'], // Yellow shades
      ['#10b981', '#34d399', '#6ee7b7'], // Green shades
      ['#8b5cf6', '#a78bfa', '#c4b5fd'], // Purple shades
    ];

    colors.forEach((colorSet, index) => {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x, y },
          colors: colorSet,
          startVelocity: 30,
          gravity: 1,
          drift: 0,
          ticks: 200,
          scalar: 1.2,
        });
      }, index * 100);
    });
  };

  const handleToggle = (checked: boolean) => {
    console.log('Toggle changed:', checked);
    setIsMonthly(!checked);
    
    // Trigger confetti when switching to annual (checked = true)
    if (checked) {
      fireConfetti();
    }
  };

  return (
    <div className="container py-20 px-4 md:px-6">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-base md:text-lg whitespace-pre-line px-4">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center mb-10 text-sm md:text-base gap-4">
        <span className={cn(
          "font-semibold transition-all duration-300",
          isMonthly ? "text-foreground scale-105" : "text-muted-foreground scale-100"
        )}>
          Bulanan
        </span>
        <div ref={switchContainerRef} className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-400 data-[state=checked]:to-orange-500"
            />
          </Label>
        </div>
        <span className={cn(
          "font-semibold transition-all duration-300 flex items-center gap-2",
          !isMonthly ? "text-foreground scale-105" : "text-muted-foreground scale-100"
        )}>
          Tahunan
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg animate-pulse">
            Hemat 20%
          </span>
        </span>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 max-w-sm md:max-w-none mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -30 : index === 0 ? 30 : 0,
                    scale: index === 0 || index === 2 ? 0.94 : 1.0,
                  }
                : { y: 0, opacity: 1 }
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `rounded-2xl border-[1px] p-5 md:p-6 bg-background text-center lg:flex lg:flex-col lg:justify-center relative`,
              plan.isPopular ? "border-blue-500 border-2 shadow-lg shadow-blue-200/50" : "border-border",
              "flex flex-col",
              !plan.isPopular && "md:mt-5",
              index === 0 || index === 2
                ? "md:z-0 md:transform md:translate-x-0 md:translate-y-0 md:-translate-z-[50px] md:rotate-y-[10deg]"
                : "md:z-10",
              index === 0 && "md:origin-right",
              index === 2 && "md:origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-blue-600 py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center z-20">
                <Star className="text-white h-4 w-4 fill-current" />
                <span className="text-white ml-1 font-sans font-semibold">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className="text-sm md:text-base font-semibold text-muted-foreground">
                {plan.name}
              </p>
              <div className="mt-4 md:mt-6 flex items-center justify-center gap-x-1 md:gap-x-2">
                <span className="text-base md:text-lg text-muted-foreground">Rp</span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                  {plan.price === "Custom" || plan.yearlyPrice === "Custom" ? (
                    <span>Custom</span>
                  ) : (
                    <NumberFlow
                      value={
                        isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                      }
                      format={{ notation: "compact" }}
                      transformTiming={{
                        duration: 500,
                        easing: "ease-out",
                      }}
                      willChange
                    />
                  )}
                </span>
                {plan.period !== "Next 3 months" && plan.price !== "Custom" && (
                  <span className="text-xs md:text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                    {isMonthly ? "/ bulan" : "/ tahun"}
                  </span>
                )}
              </div>

              <p className="text-xs leading-5 text-muted-foreground mb-3 md:mb-4">
                {plan.price === "Custom" || plan.yearlyPrice === "Custom" 
                  ? "Hubungi kami untuk penawaran khusus"
                  : isMonthly 
                    ? "dibayar bulanan" 
                    : `dibayar tahunan • Hemat Rp ${(Number(plan.price) * 12 * 0.2).toLocaleString('id-ID')}`
                }
              </p>

              <ul className="mt-2 md:mt-3 gap-1.5 md:gap-2 flex flex-col text-left">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-xs md:text-sm leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-3 md:my-4" />

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-sm md:text-base lg:text-lg font-semibold tracking-tighter py-2 md:py-3",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out",
                  plan.isPopular
                    ? "bg-yellow-500 text-white border-0 hover:bg-yellow-600 hover:shadow-lg"
                    : "bg-background text-foreground hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {plan.buttonText}
              </Link>
              <p className="mt-3 md:mt-4 text-xs leading-tight md:leading-5 text-muted-foreground">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
