import { ReactNode } from "react"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { LogOut } from "lucide-react"
import { AdminNav } from "./AdminNav"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-zinc-900/50 border-r border-white/5 backdrop-blur-xl hidden md:flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/20">
              <span className="font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="font-medium tracking-wide">Amigos del Tango</h1>
              <p className="text-xs text-zinc-500">Panel Administrativo</p>
            </div>
          </div>
          
          <AdminNav />
        </div>

        <div>
          <div className="px-4 py-4 bg-black/20 rounded-xl mb-4 border border-white/5">
            <p className="text-sm font-medium">{session.user.email}</p>
            <p className="text-xs text-zinc-500 capitalize">{session.user.role.toLowerCase()}</p>
          </div>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar Mobile */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="font-medium">CAT Admin</div>
        </header>
        
        <div className="flex-1 p-6 md:p-10 container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
