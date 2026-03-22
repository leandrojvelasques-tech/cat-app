import { db } from "@/lib/db"
import { Users, Key, Mail, Trash2, ShieldCheck, User as UserIcon } from "lucide-react"
import { UserManagementTable } from "./UserManagementTable"

export default async function UsuariosAdminPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberNumber: true
        }
      }
    }
  })

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-10 rounded-[48px] border border-white/10 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-amber-500/15 transition-all duration-700"></div>
        
        <div className="relative">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4 mb-2">
             <ShieldCheck size={40} className="text-amber-500" />
             Gestión de Accesos
          </h1>
          <p className="text-zinc-500 max-w-lg font-medium">
             Administrador de cuentas, correos y contraseñas para socios y administrativos del CAT.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-3xl border border-white/5 relative">
           <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Total Usuarios</p>
              <p className="text-2xl font-black text-white">{users.length}</p>
           </div>
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400">
              <UserIcon size={24} />
           </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 backdrop-blur-md shadow-2xl">
         <UserManagementTable users={users as any} />
      </div>
    </div>
  )
}
