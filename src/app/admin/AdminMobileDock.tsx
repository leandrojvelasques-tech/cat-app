"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, CalendarDays, CreditCard, LayoutDashboard, ShieldCheck, Users } from "lucide-react"

interface AdminMobileDockProps {
  role: string
}

export function AdminMobileDock({ role }: AdminMobileDockProps) {
  const pathname = usePathname()
  const isCollaborator = role === "COLLABORATOR"
  const links = isCollaborator
    ? [
        { href: "/admin", label: "Inicio", icon: LayoutDashboard },
        { href: "/admin/cobrar", label: "Cobrar", icon: CreditCard, primary: true },
        { href: "/admin/clases-comodoro", label: "Clases", icon: BookOpen },
        { href: "/socios", label: "Mi ficha", icon: ShieldCheck },
      ]
    : [
        { href: "/admin", label: "Inicio", icon: LayoutDashboard },
        { href: "/admin/cobrar", label: "Cobrar", icon: CreditCard, primary: true },
        { href: "/admin/estado-socios", label: "Socios", icon: Users },
        { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
      ]

  return (
    <nav
      aria-label="Accesos rápidos administrativos"
      className="cat-mobile-dock fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#121613]/95 px-2 pt-2 shadow-[0_-16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors ${
                link.primary
                  ? "bg-cat-gold text-zinc-950 shadow-lg shadow-cat-gold/15"
                  : isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={19} strokeWidth={isActive || link.primary ? 2.4 : 2} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
