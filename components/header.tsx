"use client"

import type React from "react"
import { useState } from "react"
import { Menu, X, ArrowUpRight, ArrowRight, ChevronDown } from "lucide-react"
import Image from "next/image"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const isScrolled = true

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)

    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
      setIsOpen(false)
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "px-4 pt-4" : ""}`}>
      <div
        className={`max-w-7xl mx-auto transition-all duration-300 rounded-2xl ${
          isScrolled
            ? "bg-white/70 backdrop-blur-xl border border-zinc-200 px-6 py-3"
            : "bg-background/90 backdrop-blur-md px-6 py-5"
        }`}
      >
        <div className="flex items-center justify-between">
          <a href="#" onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-12 h-12">
              <Image
                src="/images/logo/DanaMasjid.png"
                alt="DanaMasjid Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="#how-it-works"
              onClick={(e) => handleSmoothScroll(e, "how-it-works")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tentang
            </a>
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Fitur
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleSmoothScroll(e, "pricing")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Program
            </a>
            <a
              href="#testimonials"
              onClick={(e) => handleSmoothScroll(e, "testimonials")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Testimoni
            </a>
            <a
              href="#faq"
              onClick={(e) => handleSmoothScroll(e, "faq")}
              className={`text-sm transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FAQ
            </a>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium border transition-all duration-300 group ${
                  isScrolled 
                    ? "border-zinc-300 text-zinc-700" 
                    : "border-border text-foreground"
                }`}
              >
                <span className={`absolute inset-0 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center ${
                  isScrolled ? "bg-black" : "bg-foreground"
                }`} />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Masuk</span>
                <ChevronDown className={`w-4 h-4 relative z-10 transition-all duration-300 ${
                  isDropdownOpen ? "rotate-180" : ""
                } group-hover:text-white`} />
              </button>

              {isDropdownOpen && (
                <div className={`absolute top-full right-0 mt-2 w-40 rounded-lg shadow-lg border overflow-hidden ${
                  isScrolled ? "bg-white border-zinc-200" : "bg-background border-border"
                }`}>
                  <button
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      isScrolled 
                        ? "text-zinc-700 hover:bg-zinc-50" 
                        : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => {
                      setIsDropdownOpen(false)
                    }}
                  >
                    Masuk
                  </button>
                  <button
                    className={`w-full text-left px-4 py-3 text-sm transition-colors border-t ${
                      isScrolled 
                        ? "text-zinc-700 hover:bg-zinc-50 border-zinc-200" 
                        : "text-foreground hover:bg-muted border-border"
                    }`}
                    onClick={() => {
                      setIsDropdownOpen(false)
                    }}
                  >
                    Daftar
                  </button>
                  <button
                    className={`w-full text-left px-4 py-3 text-sm transition-colors border-t ${
                      isScrolled 
                        ? "text-zinc-700 hover:bg-zinc-50 border-zinc-200" 
                        : "text-foreground hover:bg-muted border-border"
                    }`}
                    onClick={() => {
                      setIsDropdownOpen(false)
                    }}
                  >
                    Jamaah
                  </button>
                </div>
              )}
            </div>

            <button
              className={`relative flex items-center gap-0 border rounded-full pl-5 pr-1 py-1 transition-all duration-300 group overflow-hidden ${
                isScrolled ? "border-zinc-300" : "border-border"
              }`}
            >
              <span
                className={`absolute inset-0 rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 ${
                  isScrolled ? "bg-black" : "bg-foreground"
                }`}
              />
              <span
                className={`text-sm pr-3 relative z-10 transition-colors duration-300 ${
                  isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                }`}
              >
                Donasi Sekarang
              </span>
              <span className="w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                <ArrowRight
                  className={`w-4 h-4 group-hover:opacity-0 absolute transition-opacity duration-300 ${
                    isScrolled ? "text-black" : "text-foreground"
                  }`}
                />
                <ArrowUpRight
                  className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                    isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                  }`}
                />
              </span>
            </button>
          </div>

          <button
            className={`lg:hidden transition-colors duration-300 ${isScrolled ? "text-black" : "text-foreground"}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <nav
            className={`lg:hidden mt-6 pb-6 flex flex-col gap-4 border-t pt-6 ${
              isScrolled ? "border-zinc-200" : "border-border"
            }`}
          >
            <a
              href="#how-it-works"
              onClick={(e) => handleSmoothScroll(e, "how-it-works")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tentang
            </a>
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Fitur
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleSmoothScroll(e, "pricing")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Program
            </a>
            <a
              href="#testimonials"
              onClick={(e) => handleSmoothScroll(e, "testimonials")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Testimoni
            </a>
            <a
              href="#faq"
              onClick={(e) => handleSmoothScroll(e, "faq")}
              className={`transition-colors cursor-pointer ${
                isScrolled ? "text-zinc-600 hover:text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FAQ
            </a>
            <div
              className={`flex flex-col gap-3 mt-4 pt-4 border-t ${isScrolled ? "border-zinc-200" : "border-border"}`}
            >
              <div className="relative">
                <button
                  onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                  className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium border w-fit transition-all duration-300 group ${
                    isScrolled 
                      ? "border-zinc-300 text-zinc-700" 
                      : "border-border text-foreground"
                  }`}
                >
                  <span className={`absolute inset-0 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center ${
                    isScrolled ? "bg-black" : "bg-foreground"
                  }`} />
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">Masuk</span>
                  <ChevronDown className={`w-4 h-4 relative z-10 transition-all duration-300 ${
                    isMobileDropdownOpen ? "rotate-180" : ""
                  } group-hover:text-white`} />
                </button>

                {isMobileDropdownOpen && (
                  <div className={`mt-2 rounded-lg shadow-lg border overflow-hidden ${
                    isScrolled ? "bg-white border-zinc-200" : "bg-background border-border"
                  }`}>
                    <button
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        isScrolled 
                          ? "text-zinc-700 hover:bg-zinc-50" 
                          : "text-foreground hover:bg-muted"
                      }`}
                      onClick={() => {
                        setIsMobileDropdownOpen(false)
                      }}
                    >
                      Masuk
                    </button>
                    <button
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-t ${
                        isScrolled 
                          ? "text-zinc-700 hover:bg-zinc-50 border-zinc-200" 
                          : "text-foreground hover:bg-muted border-border"
                      }`}
                      onClick={() => {
                        setIsMobileDropdownOpen(false)
                      }}
                    >
                      Daftar
                    </button>
                    <button
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-t ${
                        isScrolled 
                          ? "text-zinc-700 hover:bg-zinc-50 border-zinc-200" 
                          : "text-foreground hover:bg-muted border-border"
                      }`}
                      onClick={() => {
                        setIsMobileDropdownOpen(false)
                      }}
                    >
                      Jamaah
                    </button>
                  </div>
                )}
              </div>

              <button
                className={`relative flex items-center gap-0 border rounded-full pl-5 pr-1 py-1 w-fit transition-all duration-300 group overflow-hidden ${
                  isScrolled ? "border-zinc-300" : "border-border"
                }`}
              >
                <span
                  className={`absolute inset-0 rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 ${
                    isScrolled ? "bg-black" : "bg-foreground"
                  }`}
                />
                <span
                  className={`text-sm pr-3 relative z-10 transition-colors duration-300 ${
                    isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                  }`}
                >
                  Donasi Sekarang
                </span>
                <span className="w-8 h-8 rounded-full flex items-center justify-center relative z-10">
                  <ArrowRight
                    className={`w-4 h-4 group-hover:opacity-0 absolute transition-opacity duration-300 ${
                      isScrolled ? "text-black" : "text-foreground"
                    }`}
                  />
                  <ArrowUpRight
                    className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                      isScrolled ? "text-black group-hover:text-white" : "text-foreground group-hover:text-background"
                    }`}
                  />
                </span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
