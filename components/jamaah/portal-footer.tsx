import Link from "next/link"
import { Twitter, Linkedin, Instagram, Facebook } from "lucide-react"
import Image from "next/image"

export function PortalFooter() {
    return (
        <footer className="relative z-20 border-t border-border py-16 px-6 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="relative w-12 h-12">
                                <Image
                                    src="/images/logo/DanaMasjid.webp"
                                    alt="DanaMasjid Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <p className="text-sm text-muted-foreground text-center md:text-left">
                            Donasi masjid yang transparan dan amanah.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link
                            href="#"
                            className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                        >
                            <Twitter className="w-4 h-4" />
                        </Link>
                        <Link
                            href="#"
                            className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                        >
                            <Linkedin className="w-4 h-4" />
                        </Link>
                        <Link
                            href="#"
                            className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                        >
                            <Instagram className="w-4 h-4" />
                        </Link>
                        <Link
                            href="#"
                            className="w-10 h-10 border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                        >
                            <Facebook className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="pt-8 mt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">© 2026 DanaMasjid. Hak cipta dilindungi.</p>
                    <p className="text-xs text-muted-foreground">DanaMasjid - Platform Donasi Masjid Terpercaya</p>
                </div>
            </div>
        </footer>
    )
}
