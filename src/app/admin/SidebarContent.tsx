"use client"

import { LogOut } from "lucide-react"
import { AdminNav } from "./AdminNav"
import { logout } from "@/app/actions/logout"
import { OfficialLogo } from "@/components/OfficialLogo"

interface User {
  email?: string | null
  role: string
}

interface SidebarContentProps {
  user: User
  onNavigate?: () => void
}

export function SidebarContent({ user, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full w-full flex-col justify-between gap-6 overflow-y-auto">
      <div className="space-y-8">
        <div className="hidden md:flex flex-col items-start gap-3 px-2">
          <OfficialLogo className="h-auto w-full max-w-[196px] rounded-sm" priority />
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-cat-gold">Panel administrativo</p>
        </div>
        
        <div onClick={onNavigate} className="w-full">
           <AdminNav role={user.role} />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-y-4 border-t border-white/10 pt-5">
        <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
          <p className="text-sm font-bold text-white mb-1 truncate">{user.email || 'Admin'}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{user.role?.toLowerCase() || 'admin'}</p>
        </div>
        <button 
          onClick={() => logout()}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
