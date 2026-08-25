"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, Gift, Home, UserCircle } from "lucide-react"

export function SociosMobileNav() {
  const pathname = usePathname()
  const links = [
    { href: "/socios", label: "Inicio", icon: Home },
    { href: "/socios#pagos", label: "Pagos", icon: CreditCard },
    { href: "/socios#perfil", label: "Mi perfil", icon: UserCircle },
    { href: "/socios/beneficios", label: "Beneficios", icon: Gift },
  ]

  return (
    <nav
      aria-label="Navegación del portal de socios"
      className="cat-mobile-dock fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#121613]/95 px-2 pt-2 shadow-[0_-16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {links.map((link) => {
          const Icon = link.icon
          const isBenefits = link.href === "/socios/beneficios"
          const isHome = link.href === "/socios"
          const isActive = isBenefits ? pathname.startsWith(link.href) : isHome && pathname === "/socios"

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive && !link.href.includes("#") ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors ${
                isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
