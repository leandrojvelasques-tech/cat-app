import { ReactNode } from "react"
import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarContent } from "./SidebarContent"
import { MobileMenu } from "./MobileMenu"
import { CreditCard } from "lucide-react"
import { OfficialLogo } from "@/components/OfficialLogo"
import { AdminMobileDock } from "./AdminMobileDock"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  
  if (!session || !["ADMIN", "BOARD", "SUPERADMIN", "PRESIDENT", "COLLABORATOR"].includes(session.user.role)) {
    redirect("/login")
  }

  if (session.user.mustChangePassword) {
    redirect("/cambiar-clave")
  }

  const user = {
    email: session.user.email,
    role: session.user.role
  }

  return (
    <div className="cat-workspace min-h-screen text-white flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[#141916]/92 p-5 backdrop-blur-xl md:block">
        <SidebarContent user={user} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar Mobile */}
        <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#141916]/95 px-4 py-2 shadow-lg shadow-black/20 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-3">
             <OfficialLogo className="h-9 w-auto rounded-sm" priority />
             <div className="border-l border-white/10 pl-3">
               <p className="text-xs font-semibold text-white">Gestión CAT</p>
               <p className="text-[10px] text-zinc-500">Comisión directiva</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Link 
               href="/admin/cobrar"
               className="flex min-h-11 items-center gap-2 rounded-xl bg-cat-gold px-3 text-xs font-bold text-zinc-950 shadow-lg shadow-cat-gold/15 transition-all active:scale-95"
             >
                <CreditCard size={14} />
                <span>Cobrar</span>
             </Link>
             <MobileMenu user={user} />
          </div>
        </header>
        
        <main className="cat-mobile-safe-area w-full flex-1 overflow-y-auto md:pb-0">
          <div className="container mx-auto max-w-7xl p-4 sm:p-6 md:p-10">
            {children}
          </div>
        </main>
      </div>
      <AdminMobileDock role={user.role} />
    </div>
  )
}
