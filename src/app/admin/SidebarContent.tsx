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
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-xl shadow-red-900/40">
            <span className="font-black text-xl text-white">C</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white m-0">CAT</h1>
            <p className="text-[10px] text-zinc-500 uppercase font-bold m-0">Admin Panel</p>
          </div>
        </div>
        
        <div onClick={onNavigate} className="w-full">
           <AdminNav />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-y-6">
        <div className="px-4 py-4 bg-black/40 rounded-2xl border border-white/10">
          <p className="text-sm font-bold text-white mb-1 truncate">{user.email || 'Admin'}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{user.role?.toLowerCase() || 'admin'}</p>
        </div>
        <button 
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors font-bold text-sm border border-red-500/10 bg-red-500/5"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
