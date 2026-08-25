import { ReactNode } from "react"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { LogOut, Home, FileText, UserCircle } from "lucide-react"
import { OfficialLogo } from "@/components/OfficialLogo"
import { SociosMobileNav } from "./SociosMobileNav"

export default async function SociosLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  if (session.user.mustChangePassword) {
    redirect("/cambiar-clave")
  }

  return (
    <div className="cat-workspace min-h-screen text-white flex flex-col font-sans">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#141916]/95 backdrop-blur-xl">
        <div className="container mx-auto flex min-h-16 items-center justify-between px-4">
          <Link href="/socios" className="flex min-h-11 items-center gap-3 rounded-lg">
            <OfficialLogo className="h-9 w-auto rounded-sm" priority />
            <div className="border-l border-white/10 pl-3">
              <span className="block text-sm font-semibold tracking-tight text-white">Portal de socios</span>
              <span className="block text-[10px] text-zinc-500">Centro Amigos del Tango</span>
            </div>
          </Link>

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
             {session?.user && ["ADMIN", "BOARD", "SUPERADMIN"].includes(session.user.role as string) && (
               <Link 
                 href="/admin" 
                 className="flex min-h-10 items-center rounded-xl border border-cat-gold/20 bg-cat-gold/10 px-3 text-[10px] font-bold uppercase tracking-wider text-cat-gold transition-colors hover:bg-cat-gold hover:text-zinc-950"
               >
                 Panel Admin
               </Link>
             )}

             <form action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}>
              <button className="flex min-h-10 items-center gap-2 rounded-xl border border-transparent px-3 text-sm font-medium text-red-400 transition-colors hover:border-red-400/20 hover:bg-red-400/10">
                <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="cat-mobile-safe-area mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 md:p-8 md:pb-8">
        {children}
      </main>
      <SociosMobileNav />
    </div>
  )
}
