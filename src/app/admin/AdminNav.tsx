"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, CreditCard, LayoutDashboard, Settings, Calendar, ShieldCheck, BookOpen, MessageSquareText } from "lucide-react"

export function AdminNav({ role }: { role?: string }) {
  const pathname = usePathname()

  const allLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/estado-socios", icon: Users, label: "Panel de Socios" },
    { href: "/admin/cuotas", icon: CreditCard, label: "Caja" },
    { href: "/admin/eventos", icon: Calendar, label: "Eventos" },
    { href: "/admin/clases-comodoro", icon: BookOpen, label: "Clases de Tango" },
    ...(role === "ADMIN" || role === "SUPERADMIN" || role === "BOARD" || role === "PRESIDENT" ? [{ href: "/admin/comunicaciones", icon: MessageSquareText, label: "Comunicaciones" }] : []),
    // Usuarios now lives inside Ajustes (configuracion)
    ...(role === "ADMIN" || role === "SUPERADMIN" || role === "BOARD" || role === "PRESIDENT" ? [{ href: "/admin/configuracion", icon: Settings, label: "Ajustes" }] : []),
    { href: "/socios", icon: ShieldCheck, label: "Mi Ficha de Socio" }
  ]

  const links = role === "COLLABORATOR"
    ? allLinks.filter(l => ["/admin", "/admin/clases-comodoro", "/socios"].includes(l.href))
    : allLinks

  return (
    <nav className="flex flex-col gap-2">
      <Link 
        href="/admin/cobrar"
      className="group mb-4 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-cat-gold px-4 py-3 font-bold text-zinc-950 shadow-lg shadow-cat-gold/15 transition-all hover:brightness-105 active:scale-[0.98]"
      >
         <CreditCard size={20} className="group-hover:rotate-12 transition-transform" />
         <span>Cobrar</span>
      </Link>
      
      {links.map((link) => {
        const Icon = link.icon
        // Active if exactly the same, or if it's a sub-page of /admin/socios (but not Archive)
        const isClassesArea = link.href === "/admin/clases-comodoro" && pathname.startsWith("/admin/escuelita")
        const isActive = link.href === "/admin"
          ? pathname === "/admin"
          : isClassesArea || pathname.startsWith(link.href)

        return (
          <Link 
            key={link.href}
            href={link.href} 
            className={`group flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
              isActive 
                ? "border-cat-gold/20 bg-cat-gold/10 text-cat-gold"
                : "text-zinc-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10"
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${
              isActive ? "bg-cat-gold text-zinc-950" : "bg-white/5 text-zinc-500 group-hover:text-white group-hover:bg-white/10"
            }`}>
              <Icon size={18} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
            </div>
            <span className={`text-sm font-semibold tracking-tight ${isActive ? "text-white" : ""}`}>{link.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
