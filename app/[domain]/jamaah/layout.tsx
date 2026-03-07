"use client"

import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { PortalHeader } from "@/components/jamaah/portal-header"
import { PortalFooter } from "@/components/jamaah/portal-footer"

export default function JamaahLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // NOTE: Auth redirect temporarily disabled for preview
    // Uncomment below to re-enable auth protection:
    // const { user, loading } = useAuth()
    // const router = useRouter()
    // useEffect(() => {
    //   if (!loading && !user) {
    //     router.push(`/login?redirect=${pathname}&message=Silakan login untuk mengakses portal jamaah`)
    //   }
    // }, [user, loading, router, pathname])

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <PortalHeader />
            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 pt-24"
                >
                    {children}
                </motion.main>
            </AnimatePresence>
            <PortalFooter />
        </div>
    )
}
