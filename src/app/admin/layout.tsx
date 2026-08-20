import { ReactNode } from "react"
import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarContent } from "./SidebarContent"
import { MobileMenu } from "./MobileMenu"
import { CreditCard } from "lucide-react"
import { OfficialLogo } from "@/components/OfficialLogo"

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
    <div className="min-h-screen bg-zinc-950 text-white flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="w-72 bg-zinc-900/50 border-r border-white/5 backdrop-blur-xl hidden md:block">
        <SidebarContent user={user} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar Mobile */}
        <header className="md:hidden flex items-center justify-between p-3 px-4 border-b border-white/10 bg-zinc-900 backdrop-blur-md sticky top-0 z-10 shrink-0 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
             <OfficialLogo className="h-8 w-auto rounded-sm" priority />
          </div>
          <div className="flex items-center gap-3">
             <Link 
               href="/admin/cobrar"
               className="bg-gradient-to-tr from-amber-600 to-red-800 text-white p-2 rounded-xl flex items-center gap-2 text-xs font-bold px-3 active:scale-95 transition-all shadow-lg shadow-red-900/20"
             >
                <CreditCard size={14} />
                <span>Cobrar</span>
             </Link>
             <MobileMenu user={user} />
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-10 container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
