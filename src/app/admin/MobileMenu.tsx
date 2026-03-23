"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { SidebarContent } from "./SidebarContent"

interface User {
  email?: string | null
  role: string
}

interface MobileMenuProps {
  user: User
}

export function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Block scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/20 transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-amber-900/20"
        aria-label="Desplegar Menú"
      >
        <Menu size={20} className="stroke-[2.5px]" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-4/5 max-w-[300px] bg-zinc-950 border-r border-white/5 z-[100] 
        transition-transform duration-300 ease-in-out transform flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.8)]
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex justify-between items-center p-4 border-b border-white/5 shrink-0 bg-black/40">
          <div className="flex items-center gap-2 px-2">
             <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <span className="text-amber-500 font-bold text-xs uppercase">Menú</span>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-zinc-950 px-6 py-8">
           <SidebarContent 
             user={user} 
             onNavigate={() => setIsOpen(false)} 
           />
        </div>
      </div>
    </>
  )
}
