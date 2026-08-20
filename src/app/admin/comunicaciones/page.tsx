import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MessageSquareText } from "lucide-react"
import { getMemberCommunications } from "@/app/actions/member-communications"
import { MemberCommunicationsManager } from "./MemberCommunicationsManager"

export default async function AdminMemberCommunicationsPage() {
  const session = await auth()
  const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
  if (!session || !allowedRoles.includes(session.user.role)) redirect("/admin")

  const communications = await getMemberCommunications(true)

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 border-b border-white/10 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <MessageSquareText size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white/90">Comunicaciones a socios</h1>
          <p className="text-zinc-400 mt-1 text-sm max-w-2xl">
            Registre gestiones, reuniones y decisiones de la Comisión Directiva. Los socios solo verán las comunicaciones publicadas.
          </p>
        </div>
      </div>

      <MemberCommunicationsManager initialCommunications={communications} />
    </div>
  )
}
