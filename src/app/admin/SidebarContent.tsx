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
    <div className="flex flex-col h-full justify-between p-6">
      <div>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/20 shrink-0">
            <span className="font-bold text-lg">C</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="font-medium tracking-wide truncate">Amigos del Tango</h1>
            <p className="text-xs text-zinc-500">Panel Administrativo</p>
          </div>
        </div>
        
        <div onClick={onNavigate}>
           <AdminNav />
        </div>
      </div>

      <div className="mt-8">
        <div className="px-4 py-4 bg-black/20 rounded-xl mb-4 border border-white/5 overflow-hidden">
          <p className="text-sm font-medium truncate">{user.email}</p>
          <p className="text-xs text-zinc-500 capitalize">{user.role.toLowerCase()}</p>
        </div>
        <button 
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
