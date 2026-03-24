"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
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
  const [mounted, setMounted] = useState(false)

  // Block scrolling when menu is open
  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!mounted) return (
    <button 
      className="p-2.5 text-amber-500 bg-amber-500/10 rounded-xl border border-amber-500/20"
      aria-label="Cargando Menú"
    >
      <Menu size={20} className="stroke-[2.5px]" />
    </button>
  )

  const menuOverlay = (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] transition-all duration-300"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Full Screen Menu container */}
      <div className={`
        fixed inset-0 bg-zinc-950 z-[1000] 
        transition-all duration-300 ease-out transform flex flex-col
        ${isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}
      `}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div className="flex justify-between items-center p-4 px-6 border-b border-white/5 shrink-0 bg-black/60 sticky top-0 z-[1010] backdrop-blur-md">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black text-sm shadow-lg shadow-amber-900/40">
                <span>C</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Menú de Navegación</span>
                <span className="text-xs text-white/50 font-medium">Panel de Control</span>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-3 text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 active:scale-90"
            aria-label="Cerrar Menú"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar relative">
           <div className="max-w-md mx-auto w-full pb-10">
             <SidebarContent 
               user={user} 
               onNavigate={() => setIsOpen(false)} 
             />
           </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/20 transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-amber-900/20"
        aria-label="Desplegar Menú"
      >
        <Menu size={20} className="stroke-[2.5px]" />
      </button>

      {isOpen && createPortal(menuOverlay, document.body)}
    </>
  )
}
