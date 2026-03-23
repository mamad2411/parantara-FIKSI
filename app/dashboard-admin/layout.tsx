"use client"

import type { ReactNode } from "react"
import dynamic from "next/dynamic"
import "@/dashboard-component/src/index.css"
import "flatpickr/dist/flatpickr.min.css"
import "swiper/css/bundle"
import { ThemeProvider } from "@/dashboard-component/src/context/ThemeContext"

const AppLayout = dynamic(() => import("@/dashboard-component/src/layout/AppLayout"), {
  ssr: false,
})

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppLayout>{children}</AppLayout>
    </ThemeProvider>
  )
}
