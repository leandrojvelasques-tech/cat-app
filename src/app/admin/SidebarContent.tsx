"use client"

import { LogOut } from "lucide-react"
import { AdminNav } from "./AdminNav"
import { logout } from "@/app/actions/logout"

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
    <div className="flex flex-col min-h-full justify-between p-6 text-white bg-zinc-900 border-r border-white/5">
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-10 px-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-xl shadow-red-900/40 shrink-0">
            <span className="font-black text-xl">C</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg tracking-tight truncate">Amigos del Tango</h1>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Panel Administrativo</p>
          </div>
        </div>
        
        <div onClick={onNavigate} className="space-y-1">
           <AdminNav />
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5">
        <div className="px-5 py-5 bg-black/40 rounded-[24px] mb-5 border border-white/5 overflow-hidden">
          <p className="text-sm font-bold truncate text-white/90">{user.email}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">{user.role.toLowerCase()}</p>
        </div>
        <button 
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-sm bg-red-500/5"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
