"use client"

import { Award, Medal, Star, Trophy, User } from "lucide-react"
import { OfficialLogo } from "@/components/OfficialLogo"

export interface AttendedMilonga {
  id: string
  title: string
  date: Date | string
}

interface MemberBoardHistory {
  position?: string | null
}

export interface DigitalMemberCardMember {
  firstName: string
  lastName: string
  memberNumber: string | number
  dni: string
  type?: string | null
  debtStatus?: string | null
  joinDate: Date | string
  avatarUrl?: string | null
  isBoardMember?: boolean
  position?: string | null
  boardHistory?: MemberBoardHistory[]
}

export interface MemberAward {
  place: number
}

interface DigitalMemberCardProps {
  member: DigitalMemberCardMember
  awards: MemberAward[]
  attendedMilongas?: AttendedMilonga[]
  calculatedStatus?: string
}

const statusColor: Record<string, string> = {
  "AL DIA": "text-emerald-400",
  SUSPENDIDO: "text-red-400",
  "EN MORA": "text-amber-300",
}

export function DigitalMemberCard({
  member,
  awards,
  attendedMilongas = [],
  calculatedStatus,
}: DigitalMemberCardProps) {
  const hasPodium = awards.some((award) => award.place <= 3)
  const isChampion = awards.some((award) => award.place === 1)
  const isHonorario = member.type === "HONORARIO"
  const membershipStatus = calculatedStatus || member.debtStatus || "AL DIA"
  const membershipStatusColor = statusColor[membershipStatus] || "text-zinc-300"
  const wasPresident = member.boardHistory?.some((history) =>
    history.position?.toLocaleLowerCase("es-AR").includes("presidente")
  )
  const memberType = String(member.type || "ACTIVO").toLocaleLowerCase("es-AR")

  return (
    <article
      aria-label={`Carnet digital de ${member.firstName} ${member.lastName}`}
      className={`relative mx-auto flex h-[500px] w-full max-w-[360px] flex-col overflow-hidden rounded-[30px] border px-5 py-[18px] shadow-2xl sm:h-auto sm:max-w-none sm:aspect-[1.72/1] sm:px-8 sm:py-7 ${
        isHonorario
          ? "border-amber-500/40 bg-gradient-to-br from-zinc-900 via-amber-950/35 to-yellow-950/25 shadow-amber-900/20"
          : isChampion
            ? "border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-900/35"
            : "border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-tr opacity-10 ${
          isHonorario
            ? "from-yellow-400 via-amber-500 to-amber-700"
            : isChampion
              ? "from-amber-600 via-amber-400 to-yellow-200"
              : "from-amber-800 to-zinc-900"
        }`}
      />
      <div className="pointer-events-none absolute -bottom-2 left-3 select-none font-serif text-[48px] font-semibold tracking-[-0.06em] text-white/[0.025] sm:text-7xl">
        VIENTOS DE TANGO
      </div>

      <header className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <OfficialLogo compact className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <h2 className="font-serif text-[15px] font-semibold leading-tight text-white/90 sm:text-lg">
              Centro Amigos del Tango
            </h2>
            <p className="mt-0.5 text-[9px] tracking-[0.08em] text-zinc-500 sm:text-[10px]">
              Fundado el 13 de noviembre de 2002
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {isHonorario && (
            <span title="Socio honorario" className="text-amber-400">
              <Award size={17} aria-hidden />
            </span>
          )}
          {isChampion && (
            <span title="Campeón CAT" className="text-amber-400">
              <Trophy size={17} aria-hidden />
            </span>
          )}
          {member.isBoardMember && !isChampion && (
            <span title={member.position || "Comisión Directiva"} className="text-amber-400">
              <Star size={17} aria-hidden />
            </span>
          )}
        </div>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pt-2 sm:flex-row sm:items-end sm:justify-start sm:gap-7 sm:pt-0">
        <div className="relative shrink-0">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] text-zinc-700 shadow-xl sm:h-28 sm:w-28">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                className="h-full w-full object-cover"
                alt={`Foto de ${member.firstName} ${member.lastName}`}
              />
            ) : (
              <User size={40} className="opacity-30" aria-hidden />
            )}
          </div>
          {hasPodium && (
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-zinc-950 bg-amber-500 text-zinc-950 shadow-xl">
              <Medal size={16} aria-hidden />
            </div>
          )}
        </div>

        <div className="mt-5 w-full text-center sm:mt-0 sm:flex-1 sm:pb-1 sm:text-left">
          <h3 className="text-balance font-serif text-[28px] font-semibold leading-[0.95] tracking-[-0.03em] text-white sm:text-[38px]">
            {member.lastName}, {member.firstName}
          </h3>

          <dl className="mt-5 grid grid-cols-3 gap-2 sm:max-w-lg sm:gap-5">
            <div>
              <dt className="text-[8px] font-semibold uppercase tracking-[0.15em] text-zinc-600">Nro. socio</dt>
              <dd className="mt-1 text-sm font-semibold text-amber-400 sm:text-base">#{member.memberNumber}</dd>
            </div>
            <div>
              <dt className="text-[8px] font-semibold uppercase tracking-[0.15em] text-zinc-600">DNI</dt>
              <dd className="mt-1 text-sm font-medium text-zinc-300 sm:text-base">{member.dni}</dd>
            </div>
            <div>
              <dt className="text-[8px] font-semibold uppercase tracking-[0.15em] text-zinc-600">Categoría</dt>
              <dd className="mt-1 text-sm font-medium capitalize text-zinc-300 sm:text-base">{memberType}</dd>
            </div>
          </dl>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/[0.07] pt-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Socio desde</p>
            <p className="mt-0.5 text-[11px] font-medium text-zinc-300">
              {new Date(member.joinDate).getFullYear()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Estado de deuda</p>
            <p className={`mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-semibold ${membershipStatusColor}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              {membershipStatus}
            </p>
          </div>
        </div>

        {(attendedMilongas.length > 0 || awards.length > 0 || wasPresident) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/[0.05] pt-2 text-[9px] text-zinc-500">
            {attendedMilongas.length > 0 && (
              <span>{attendedMilongas.length} {attendedMilongas.length === 1 ? "milonga registrada" : "milongas registradas"}</span>
            )}
            {awards.length > 0 && <span>{awards.length} {awards.length === 1 ? "distinción" : "distinciones"}</span>}
            {wasPresident && <span className="text-amber-500/80">Ex presidente</span>}
          </div>
        )}
      </footer>
    </article>
  )
}
