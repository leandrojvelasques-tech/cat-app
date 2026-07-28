import { db } from "@/lib/db"
import { Archive } from "lucide-react"
import Link from "next/link"
import { SociosFilters } from "../socios/SociosFilters"
import { Member } from "@prisma/client"
import { calculateMemberStatus, getStatusBadgeStyles, getMemberBajaReason, getBajaReasonStyles } from "@/lib/member-utils"

export default async function ArchivoSociosPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string }>
}) {
  const { query = "", status = "" } = await searchParams

  const members = await db.member.findMany({
    where: {
      status: status ? (status === "INACTIVE" ? { in: ["INACTIVE", "ARCHIVED"] } : status) : { in: ["INACTIVE", "DECEASED", "RESIGNED", "ARCHIVED"] },
      AND: [
        query
          ? {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { dni: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    },
    orderBy: { lastName: "asc" },
  })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white/90">Archivo de Socios</h1>
        <p className="text-zinc-400 mt-1">Historial de socios dados de baja (fallecimiento, renuncia o baja administrativa).</p>
      </div>

      <SociosFilters />

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">Nro Socio</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">Nombre Completo</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">DNI</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">Motivo Baja</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No hay socios en el archivo.
                  </td>
                </tr>
              ) : (
                members.map((member: Member) => {
                  const calculated = calculateMemberStatus(member)
                  const bajaReason = getMemberBajaReason(member)
                  return (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-zinc-500 font-medium">#{member.memberNumber}</td>
                      <td className="px-6 py-4 text-zinc-300">
                        {member.lastName}, {member.firstName}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{member.dni}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-3 py-1 text-[9px] uppercase font-black rounded-lg border shadow-sm ${getStatusBadgeStyles(calculated)}`}>
                            {calculated}
                          </span>
                          {bajaReason && (
                            <span className={`px-2 py-0.5 text-[8px] uppercase font-bold rounded-md border ${getBajaReasonStyles(bajaReason)}`}>
                              {bajaReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/socios/${member.id}`}
                          className="text-zinc-400 hover:text-white font-medium text-sm transition-colors"
                        >
                          Ver Ficha
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
