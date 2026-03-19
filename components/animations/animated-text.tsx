"use client"

import { useMemo } from "react"

interface AnimatedTextProps {
  text: string
  delay?: number
}

export function AnimatedText({ text, delay = 0 }: AnimatedTextProps) {
  const chars = useMemo(() => Array.from(text), [text])

  return (
    <span
      className="font-bold text-center leading-[0.75] text-black block"
      style={{ perspective: 400, fontFamily: "'ArabicRamadan', serif", letterSpacing: "0.08em" }}
    >
      {chars.map((char, i) => {
        const isSpace = char === " "
        if (isSpace) return <span key={`space-${i}`}>{" "}</span>

        return (
          <span
            key={`${char}-${i}`}
            className="dm-animated-char"
            style={{
              animationDelay: `${delay + i * 0.04}s`,
            }}
            aria-hidden="true"
          >
            {char}
          </span>
        )
      })}
      <span className="sr-only">{text}</span>
    </span>
  )
}
