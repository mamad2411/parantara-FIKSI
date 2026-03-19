import Script from "next/script"
import { AuthProvider } from "@/lib/auth-context"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
