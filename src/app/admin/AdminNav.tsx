"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, CreditCard, LayoutDashboard, Settings, Archive, Calendar, Trophy, ShieldCheck } from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  const links = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/socios", icon: Users, label: "Directorio de Socios" },
    { href: "/admin/cuotas", icon: CreditCard, label: "Cobranzas" },
    { href: "/admin/eventos", icon: Calendar, label: "Eventos" },
    { href: "/admin/vientos-de-tango", icon: Trophy, label: "Vientos de Tango" },
    { href: "/admin/usuarios", icon: ShieldCheck, label: "Usuarios" },
    { href: "/admin/configuracion", icon: Settings, label: "Ajustes" },
  ]

  return (
    <nav className="flex flex-col gap-2">
      <Link 
        href="/admin/cobrar"
        className="flex items-center justify-center gap-3 w-full bg-gradient-to-tr from-amber-600 to-red-800 hover:from-amber-500 text-white p-4 rounded-2xl font-bold transition-all mb-4 shadow-xl shadow-red-900/20 active:scale-95 group"
      >
         <CreditCard size={20} className="group-hover:rotate-12 transition-transform" />
         <span>Cobrar</span>
      </Link>
      
      {links.map((link) => {
        const Icon = link.icon
        // Active if exactly the same, or if it's a sub-page of /admin/socios (but not Archive)
        const isActive = link.href === "/admin" 
          ? pathname === "/admin" 
          : pathname.startsWith(link.href)

        return (
          <Link 
            key={link.href}
            href={link.href} 
            className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 ${
              isActive 
                ? "bg-amber-600/10 text-amber-500 border border-amber-600/10" 
                : "text-zinc-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon size={20} className={isActive ? "text-amber-500" : ""} />
            <span className="font-medium">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
