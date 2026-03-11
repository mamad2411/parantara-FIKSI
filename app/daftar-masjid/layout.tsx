import type React from "react"
import { RecaptchaProvider } from "@/components/providers"

export default function DaftarMasjidLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RecaptchaProvider>{children}</RecaptchaProvider>
}

