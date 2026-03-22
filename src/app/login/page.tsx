"use client"

import { useActionState } from "react"
import { authenticate } from "@/app/actions/auth"
import { LogIn, Info } from "lucide-react"

export default function LoginPage() {
  // Simplificamos omitiendo useActionState temporalmente para asegurar el envío
  // En React 19 / Next 16 beta/canary, esto ayudará a depurar si el problema es el hook
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light text-white tracking-wide mb-2">Centro Amigos del Tango</h1>
          <p className="text-zinc-400 font-light tracking-widest text-sm uppercase">Portal de Gestión</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form action={authenticate} className="flex flex-col gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="email">Email / Usuario</label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-light"
                placeholder="socio@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-light"
                placeholder="••••••••"
              />
            </div>



            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group mt-4 shadow-lg shadow-red-900/20"
            >
              <LogIn className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Ingresar</span>
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-sm text-zinc-500">
          <p>¿Problemas para ingresar? Contacte a administración.</p>
        </div>
      </div>
    </div>
  )
}
