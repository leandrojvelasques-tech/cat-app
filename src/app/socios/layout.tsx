import { ReactNode } from "react"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { LogOut, Home, FileText, UserCircle } from "lucide-react"

export default async function SociosLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Navbar Premium para Socios */}
      <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-red-800 flex items-center justify-center text-white shadow-md">
              <span className="font-bold text-sm">C</span>
            </div>
            <span className="font-semibold tracking-tight text-lg text-white">CAT Socios</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/socios" className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
              <Home size={16} /> Inicio
            </Link>
            <Link href="/socios#pagos" className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
              <FileText size={16} /> Mis Pagos
            </Link>
            <Link href="/socios#perfil" className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
              <UserCircle size={16} /> Mi Perfil
            </Link>
          </nav>

          <div className="flex items-center gap-4">
             <form action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}>
              <button className="text-sm font-medium text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 border border-transparent hover:border-red-400/20">
                <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
