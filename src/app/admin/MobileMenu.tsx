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
        fixed top-0 left-0 bottom-0 w-[280px] bg-zinc-900 border-r border-white/10 z-[60] 
        transition-transform duration-300 ease-in-out transform flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex justify-end p-4 border-b border-white/5 shrink-0">
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-8">
           <div className="mb-8">
              <span className="text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase">Administración</span>
              <h2 className="text-xl font-bold text-white mt-1">Opciones</h2>
           </div>
           
           <div className="space-y-6">
              <SidebarContent 
                user={user} 
                onNavigate={() => setIsOpen(false)} 
              />
           </div>
        </div>
      </div>
    </>
  )
}
