"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Menu, X } from "lucide-react"
import { SidebarContent } from "./SidebarContent"
import { OfficialLogo } from "@/components/OfficialLogo"

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
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = isOpen ? "hidden" : previousOverflow

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [isOpen])

  const menuOverlay = (
    <>
      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-sm transition-opacity"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Full Screen Menu container */}
      <div
      role="dialog"
      aria-modal="true"
      aria-label="Menú administrativo"
      className={`
        fixed inset-y-0 right-0 z-[1000] flex w-[min(90vw,380px)] flex-col border-l border-white/10 bg-[#121613]
        shadow-[-24px_0_70px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out
        ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
      `}
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0 }}
      >
        <div className="sticky top-0 z-[1010] flex shrink-0 items-center justify-between border-b border-white/10 bg-[#121613]/95 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
             <OfficialLogo className="h-10 w-auto rounded-sm" priority />
             <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Menú de gestión</span>
                <span className="text-[10px] text-zinc-500">Centro Amigos del Tango</span>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
            aria-label="Cerrar Menú"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="custom-scrollbar relative flex-1 overflow-y-auto px-5 py-6">
           <div className="mx-auto w-full max-w-md pb-10">
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
        className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-cat-gold/20 bg-cat-gold/10 text-cat-gold transition-colors hover:bg-cat-gold/15 active:scale-95"
        aria-label="Desplegar Menú"
      >
        <Menu size={20} className="stroke-[2.5px]" />
      </button>

      {isOpen && createPortal(menuOverlay, document.body)}
    </>
  )
}
