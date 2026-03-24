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
            className={`flex items-center gap-4 px-5 py-4.5 rounded-2xl transition-all duration-300 group border ${
              isActive 
                ? "bg-amber-600/10 text-amber-500 border-amber-600/20 shadow-lg shadow-amber-900/5 ring-1 ring-amber-500/20" 
                : "text-zinc-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10"
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${
              isActive ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-900/40" : "bg-white/5 text-zinc-500 group-hover:text-white group-hover:bg-white/10"
            }`}>
              <Icon size={18} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
            </div>
            <span className={`font-bold tracking-tight text-base ${isActive ? "text-white" : ""}`}>{link.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
