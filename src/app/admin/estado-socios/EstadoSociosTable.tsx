"use client"

import { useState, useTransition } from "react"
import { Users, Mail, X, Loader2, Square, CheckSquare, Send, CheckCircle, Download, ShieldAlert, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { sendBatchEmail } from "@/app/actions/batch-emails"
import { getStatusBadgeStyles } from "@/lib/member-utils"
import { SendMemberAccessButton } from "../socios/components/SendMemberAccessButton"

interface EstadoSociosTableProps {
  initialMembers: any[]
}

export function EstadoSociosTable({ initialMembers }: EstadoSociosTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [senderEmail, setSenderEmail] = useState("socios@centroamigosdeltango.com")
  const [subject, setSubject] = useState("")
  const [bodyTemplate, setBodyTemplate] = useState("")
  const [isPending, startTransition] = useTransition()
  const [sendResult, setSendResult] = useState<{ success: boolean; sentCount: number; skippedCount: number } | null>(null)

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [filterMissing, setFilterMissing] = useState<string>("ALL") // ALL, NO_EMAIL, NO_PHONE, NO_CONTACT

  // Sorts
  const [statusSort, setStatusSort] = useState<"NONE" | "ASC" | "DESC">("NONE")
  const [paymentSort, setPaymentSort] = useState<"NONE" | "NEWEST" | "OLDEST">("NONE")

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  // Calculate totals from initialMembers
  const totalAlDia = initialMembers.filter((m: any) => m.calculatedStatus === 'AL DIA').length
  const totalEnMora = initialMembers.filter((m: any) => m.calculatedStatus === 'EN MORA').length
  const totalSuspendidos = initialMembers.filter((m: any) => m.calculatedStatus === 'SUSPENDIDO').length

  // Select group helper (selects members in current group who HAVE an email)
  const getGroupMembers = (group: 'AL DIA' | 'EN MORA' | 'SUSPENDIDOS') => {
    return initialMembers.filter((m: any) => {
      if (group === 'AL DIA') return m.calculatedStatus === 'AL DIA'
      if (group === 'EN MORA') return m.calculatedStatus === 'EN MORA'
      return m.calculatedStatus === 'SUSPENDIDO'
    }).filter(m => m.email)
  }

  const isGroupAllSelected = (group: 'AL DIA' | 'EN MORA' | 'SUSPENDIDOS') => {
    const groupMembers = getGroupMembers(group)
    if (groupMembers.length === 0) return false
    return groupMembers.every(m => selectedIds.includes(m.id))
  }

  const isGroupAnySelected = (group: 'AL DIA' | 'EN MORA' | 'SUSPENDIDOS') => {
    const groupMembers = getGroupMembers(group)
    return groupMembers.some(m => selectedIds.includes(m.id))
  }

  function handleSelectStatusGroup(group: 'AL DIA' | 'EN MORA' | 'SUSPENDIDOS') {
    const groupMembers = getGroupMembers(group)
    const groupIds = groupMembers.map(m => m.id)
    if (groupIds.length === 0) return

    const allSelected = isGroupAllSelected(group)

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !groupIds.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...groupIds])))
    }
  }

  function handleSelectMember(id: string) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // 1. Filter displayed members
  let displayedMembers = [...initialMembers]

  if (filterStatus !== "ALL") {
    displayedMembers = displayedMembers.filter(m => {
      if (filterStatus === "AL DIA") return m.calculatedStatus === "AL DIA"
      if (filterStatus === "EN MORA") return m.calculatedStatus === "EN MORA"
      if (filterStatus === "SUSPENDIDOS") return m.calculatedStatus === "SUSPENDIDO"
      return true
    })
  }

  if (filterMissing !== "ALL") {
    displayedMembers = displayedMembers.filter(m => {
      if (filterMissing === "NO_EMAIL") return !m.email
      if (filterMissing === "NO_PHONE") return !m.phone
      if (filterMissing === "NO_CONTACT") return !m.email || !m.phone
      return true
    })
  }

  // 2. Sort displayed members
  if (statusSort !== "NONE") {
    const order = { "AL DIA": 1, "EN MORA": 2, "INACTIVO": 3, "SUSPENDIDO": 3, "BAJA": 3 } as any
    displayedMembers.sort((a, b) => {
      const orderA = order[a.calculatedStatus] || 99
      const orderB = order[b.calculatedStatus] || 99
      return statusSort === "ASC" ? orderA - orderB : orderB - orderA
    })
  } else if (paymentSort !== "NONE") {
    displayedMembers.sort((a, b) => {
      const dateA = a.fees[0]?.paymentDate ? new Date(a.fees[0].paymentDate).getTime() : 0
      const dateB = b.fees[0]?.paymentDate ? new Date(b.fees[0].paymentDate).getTime() : 0
      return paymentSort === "NEWEST" ? dateB - dateA : dateA - dateB
    })
  }

  const allSelectableIds = displayedMembers.map(m => m.id)
  const isAllSelected = allSelectableIds.length > 0 && allSelectableIds.every(id => selectedIds.includes(id))

  function handleSelectAll() {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allSelectableIds.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allSelectableIds])))
    }
  }

  function toggleStatusSort() {
    setPaymentSort("NONE")
    setStatusSort(prev => {
      if (prev === "NONE") return "ASC"
      if (prev === "ASC") return "DESC"
      return "NONE"
    })
  }

  function togglePaymentSort() {
    setStatusSort("NONE")
    setPaymentSort(prev => {
      if (prev === "NONE") return "NEWEST"
      if (prev === "NEWEST") return "OLDEST"
      return "NONE"
    })
  }

  // Count valid emails among selected
  const selectedMembersWithEmail = initialMembers.filter(m => selectedIds.includes(m.id) && m.email)
  const selectedCountWithoutEmail = selectedIds.length - selectedMembersWithEmail.length

  function handleSendBatch() {
    if (selectedIds.length === 0) return
    setSendResult(null)
    setIsModalOpen(true)
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedMembersWithEmail.length === 0) {
      alert("Ninguno de los socios seleccionados tiene un correo electrónico válido.")
      return
    }

    startTransition(async () => {
      const res = await sendBatchEmail(
        selectedMembersWithEmail.map(m => m.id),
        subject,
        bodyTemplate,
        `CAT WEB <${senderEmail}>`
      )
      if (res.success) {
        setSendResult({
          success: true,
          sentCount: res.sentCount || 0,
          skippedCount: (res.skippedCount || 0) + selectedCountWithoutEmail
        })
        setSelectedIds([])
        setSubject("")
        setBodyTemplate("")
      } else {
        alert(res.error || "Hubo un error al enviar el lote.")
      }
    })
  }

  // Export visible list to CSV (Excel compatible)
  function handleExportCSV() {
    const headers = ["Número Socio", "Apellido", "Nombre", "DNI", "Email", "Teléfono", "Estado Real", "Último Pago"]
    const rows = displayedMembers.map(m => {
      const lastFee = m.fees[0]
      const lastPaidLabel = lastFee ? `${monthNames[lastFee.periodMonth-1]} ${lastFee.periodYear}` : 'Sin pagos'
      return [
        m.memberNumber,
        m.lastName,
        m.firstName,
        m.dni,
        m.email || "Sin email",
        m.phone || "Sin teléfono",
        m.calculatedStatus,
        lastPaidLabel
      ]
    })
    
    // Add UTF-8 BOM so Excel opens accents correctly
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Socios_CAT_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleOpenMailModal() {
    if (selectedIds.length === 0) {
      const idsWithEmail = displayedMembers.filter(m => m.email).map(m => m.id)
      setSelectedIds(idsWithEmail)
    }
    setSendResult(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Interactive Stats Cards (Clicking filters the table below) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Al Día */}
        <div 
          onClick={() => setFilterStatus(prev => prev === "AL DIA" ? "ALL" : "AL DIA")}
          className={`cursor-pointer p-5 rounded-[24px] flex flex-col justify-center items-center border transition-all hover:scale-[1.02] active:scale-95 ${
            filterStatus === 'AL DIA'
              ? 'bg-emerald-950/80 border-emerald-500 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/50'
              : 'bg-emerald-900/10 border-emerald-500/10 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-emerald-400">{totalAlDia}</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-500/80 mt-1">Socios Al Día</span>
          <span className="text-[9px] text-zinc-400 mt-2 uppercase font-black tracking-widest">
            {filterStatus === 'AL DIA' ? '✓ Filtrando Al Día (clic para quitar)' : 'Filtrar por Al Día'}
          </span>
        </div>

        {/* Card En Mora */}
        <div 
          onClick={() => setFilterStatus(prev => prev === "EN MORA" ? "ALL" : "EN MORA")}
          className={`cursor-pointer p-5 rounded-[24px] flex flex-col justify-center items-center border transition-all hover:scale-[1.02] active:scale-95 ${
            filterStatus === 'EN MORA'
              ? 'bg-amber-950/80 border-amber-500 shadow-xl shadow-amber-500/20 ring-2 ring-amber-500/50'
              : 'bg-amber-900/10 border-amber-500/10 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-amber-400">{totalEnMora}</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-500/80 mt-1">En Mora (90 días)</span>
          <span className="text-[9px] text-zinc-400 mt-2 uppercase font-black tracking-widest">
            {filterStatus === 'EN MORA' ? '✓ Filtrando En Mora (clic para quitar)' : 'Filtrar por En Mora'}
          </span>
        </div>

        {/* Card Suspendidos */}
        <div 
          onClick={() => setFilterStatus(prev => prev === "SUSPENDIDOS" ? "ALL" : "SUSPENDIDOS")}
          className={`cursor-pointer p-5 rounded-[24px] flex flex-col justify-center items-center border transition-all hover:scale-[1.02] active:scale-95 ${
            filterStatus === 'SUSPENDIDOS'
              ? 'bg-zinc-800/90 border-white/40 shadow-xl ring-2 ring-white/30'
              : 'bg-zinc-900/20 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-zinc-400">{totalSuspendidos}</span>
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-zinc-400 mt-1">Suspendidos (+3 cuotas)</span>
          <span className="text-[9px] text-zinc-400 mt-2 uppercase font-black tracking-widest">
            {filterStatus === 'SUSPENDIDOS' ? '✓ Filtrando Suspendidos (clic para quitar)' : 'Filtrar por Suspendidos'}
          </span>
        </div>
      </div>

      {/* Filter and Actions Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white/5 p-4 rounded-[24px] border border-white/10 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 ml-1">Filtrar por Estado</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-300 font-bold focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="AL DIA">Solo Al Día</option>
              <option value="EN MORA">Solo En Mora</option>
              <option value="SUSPENDIDOS">Solo Suspendidos</option>
            </select>
          </div>

          {/* Missing Contact Info Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 ml-1">Rastrillaje de Contacto</span>
            <select
              value={filterMissing}
              onChange={(e) => setFilterMissing(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-zinc-300 font-bold focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="ALL">Todos los Datos</option>
              <option value="NO_EMAIL">Sin Email Cargado</option>
              <option value="NO_PHONE">Sin Teléfono Cargado</option>
              <option value="NO_CONTACT">Sin Email o Sin Teléfono</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
          <button
            onClick={handleOpenMailModal}
            disabled={displayedMembers.length === 0}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-30 text-black px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
          >
            <Mail size={16} />
            <span>Enviar Mail {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={displayedMembers.length === 0}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            <Download size={16} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Floating Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex justify-between items-center gap-4 bg-gradient-to-tr from-amber-600 to-red-800 p-6 rounded-[24px] border border-white/10 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Users size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Acción por lote disponible</p>
              <p className="text-amber-200 text-xs font-light">
                {selectedIds.length} {selectedIds.length === 1 ? 'socio seleccionado' : 'socios seleccionados'}.
                {selectedCountWithoutEmail > 0 && ` (${selectedCountWithoutEmail} sin email).`}
              </p>
            </div>
          </div>
          <button
            onClick={handleSendBatch}
            className="flex items-center gap-2 bg-zinc-950 text-white hover:bg-zinc-900 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all shadow-lg"
          >
            <Mail size={16} />
            <span>Enviar Correo</span>
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-[40px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-5 pl-6 w-12 text-center">
                  <button 
                    onClick={handleSelectAll}
                    disabled={allSelectableIds.length === 0}
                    className="text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="text-amber-500" size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Socio</th>
                <th className="py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <button 
                    onClick={toggleStatusSort}
                    className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none"
                  >
                    <span>Estado Real</span>
                    <ArrowUpDown size={14} className={statusSort !== "NONE" ? "text-amber-500" : "text-zinc-600"} />
                    {statusSort === "ASC" && <span className="text-[8px] text-amber-500">▲</span>}
                    {statusSort === "DESC" && <span className="text-[8px] text-amber-500">▼</span>}
                  </button>
                </th>
                <th className="py-5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <button 
                    onClick={togglePaymentSort}
                    className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none"
                  >
                    <span>Último Pago</span>
                    <ArrowUpDown size={14} className={paymentSort !== "NONE" ? "text-amber-500" : "text-zinc-600"} />
                    {paymentSort === "NEWEST" && <span className="text-[8px] text-amber-500">Recientes</span>}
                    {paymentSort === "OLDEST" && <span className="text-[8px] text-amber-500">Antiguos</span>}
                  </button>
                </th>
                <th className="py-5 pr-6 text-right text-xs font-bold uppercase tracking-widest text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayedMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-500 italic">
                    Ningún socio coincide con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                displayedMembers.map((member: any) => {
                  const calculated = member.calculatedStatus
                  const lastFee = member.fees[0]
                  const lastPaidLabel = lastFee ? `${monthNames[lastFee.periodMonth-1]} ${lastFee.periodYear}` : 'Sin pagos'
                  const isSelected = selectedIds.includes(member.id)

                  return (
                    <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                      <td className="py-4 pl-6 text-center">
                        <button
                          onClick={() => handleSelectMember(member.id)}
                          className="text-zinc-600 hover:text-white transition-colors"
                          title="Seleccionar socio"
                        >
                          {isSelected ? (
                            <CheckSquare className="text-amber-500" size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-zinc-300 font-black text-xs ring-1 ring-white/10 group-hover:ring-white/20 transition-all shadow-lg overflow-hidden">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <>{member.firstName[0]}{member.lastName[0]}</>
                            )}
                          </div>
                          <div>
                            <p className="text-zinc-100 font-bold group-hover:text-amber-400 transition-colors">
                              {member.lastName}, {member.firstName}
                            </p>
                            <div className="flex flex-col gap-0.5 mt-1 text-[10px]">
                              <span className="text-zinc-500 font-medium">Socio #{member.memberNumber}</span>
                              <span className={member.email ? "text-zinc-400 font-light" : "text-red-400/80 italic font-light"}>
                                {member.email || "sin email cargado"}
                              </span>
                              <span className={member.phone ? "text-zinc-400 font-light" : "text-red-400/80 italic font-light"}>
                                {member.phone || "sin teléfono cargado"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 text-[9px] uppercase font-black rounded-lg border shadow-sm ${getStatusBadgeStyles(calculated)}`}>
                          {calculated}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-zinc-300 text-sm">{lastPaidLabel}</span>
                          {lastFee?.paymentDate && (
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {new Date(lastFee.paymentDate).toLocaleDateString('es-AR')}
                            </span>
                          )}
                          {member.isFamilyDiscount && (
                            <span className="text-[9px] text-blue-400 font-black flex items-center gap-1 mt-1 uppercase tracking-tighter">
                              <Users size={10}/> 50% PAREJA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <SendMemberAccessButton
                            memberId={member.id}
                            memberName={`${member.firstName} ${member.lastName}`}
                            memberEmail={member.email}
                            username={member.user?.email || null}
                          />
                          <Link 
                            href={`/admin/socios/${member.id}`}
                            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                          >
                            Ver ficha
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile directory: the identity is the navigation target, while status and contact remain readable below it. */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md md:hidden">
        {displayedMembers.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm italic text-zinc-500">
            Ningún socio coincide con los filtros aplicados.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {displayedMembers.map((member: any) => {
              const calculated = member.calculatedStatus
              const lastFee = member.fees[0]
              const lastPaidLabel = lastFee ? `${monthNames[lastFee.periodMonth - 1]} ${lastFee.periodYear}` : "Sin pagos"
              const isSelected = selectedIds.includes(member.id)

              return (
                <article key={member.id} className={`p-4 transition-colors ${isSelected ? "bg-amber-500/10" : "bg-transparent"}`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectMember(member.id)}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                      title="Seleccionar socio"
                      aria-label={`Seleccionar a ${member.lastName}, ${member.firstName}`}
                    >
                      {isSelected ? <CheckSquare className="text-amber-500" size={20} /> : <Square size={20} />}
                    </button>

                    <Link
                      href={`/admin/socios/${member.id}`}
                      className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-none"
                      aria-label={`Abrir ficha de ${member.lastName}, ${member.firstName}`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 text-xs font-black text-zinc-300 ring-1 ring-white/10">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <>{member.firstName[0]}{member.lastName[0]}</>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold uppercase text-zinc-100 transition-colors group-hover:text-amber-400">
                          {member.lastName}, {member.firstName}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-zinc-500">Socio #{member.memberNumber}</p>
                      </div>
                    </Link>
                  </div>

                  <div className="mt-3 space-y-2 pl-14">
                    <div className="space-y-1 text-xs">
                      <p className={member.email ? "truncate text-zinc-400" : "text-red-400/80 italic"}>
                        {member.email || "Sin email cargado"}
                      </p>
                      <p className={member.phone ? "text-zinc-400" : "text-red-400/80 italic"}>
                        {member.phone || "Sin teléfono cargado"}
                      </p>
                    </div>

                    <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Estado</p>
                        <span className={`mt-1 inline-flex rounded-lg border px-3 py-1 text-[10px] font-black uppercase shadow-sm ${getStatusBadgeStyles(calculated)}`}>
                          {calculated}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Último pago</p>
                        <p className="mt-1 text-xs font-semibold text-zinc-300">{lastPaidLabel}</p>
                        {member.isFamilyDiscount && (
                          <p className="mt-1 flex items-center justify-end gap-1 text-[9px] font-black uppercase tracking-tight text-blue-400">
                            <Users size={10} /> 50% pareja
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Batch Email Sender Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setIsModalOpen(false)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 p-8 md:p-10 rounded-[48px] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_0_80px_rgba(0,0,0,0.6)] space-y-8 animate-in zoom-in-95 duration-200 relative custom-scrollbar">
            <div className="flex justify-between items-center sticky top-0 bg-zinc-900 z-10 pb-4">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                  <Mail className="text-amber-500" size={24} />
                  <span>Comunicación por Lote</span>
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">
                  Enviando correo a {selectedMembersWithEmail.length} socios de {selectedIds.length} seleccionados
                </p>
              </div>
              <button 
                onClick={() => {
                  if (!isPending) {
                    setIsModalOpen(false)
                    setSendResult(null)
                  }
                }}
                className="p-3 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all shadow-inner border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {sendResult ? (
              <div className="space-y-6 text-center py-6 animate-in scale-in duration-300">
                <div className="flex justify-center text-emerald-500">
                  <CheckCircle className="w-16 h-16 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">¡Envío Completado!</h4>
                  <p className="text-zinc-400 text-sm font-light">
                    Se procesaron las comunicaciones por lote con los siguientes resultados:
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mt-4">
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl">
                      <span className="block text-2xl font-black text-emerald-400">{sendResult.sentCount}</span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Enviados</span>
                    </div>
                    <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-2xl">
                      <span className="block text-2xl font-black text-red-400">{sendResult.skippedCount}</span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">Omitidos/Fallidos</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsModalOpen(false)
                      setSendResult(null)
                    }}
                    className="bg-white text-zinc-950 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:scale-105 transition-all"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6 pt-2">
                {selectedCountWithoutEmail > 0 && (
                  <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-amber-500 text-xs font-medium animate-in fade-in">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Socios sin email seleccionados</p>
                      <p className="font-light mt-0.5">Hay {selectedCountWithoutEmail} socios seleccionados que no tienen correo cargado. Serán omitidos automáticamente del envío.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">De (Remitente)</label>
                  <select
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                  >
                    <option value="socios@centroamigosdeltango.com">socios@centroamigosdeltango.com</option>
                    <option value="cobranzas@centroamigosdeltango.com">cobranzas@centroamigosdeltango.com</option>
                    <option value="info@centroamigosdeltango.com">info@centroamigosdeltango.com</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Asunto</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej. Aviso de Regularización de Cuota Social"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Mensaje (Cuerpo)</label>
                  <textarea
                    required
                    rows={8}
                    value={bodyTemplate}
                    onChange={(e) => setBodyTemplate(e.target.value)}
                    placeholder="Estimado/a {nombre},&#10;&#10;Nos comunicamos para informarle que su estado actual es: {estado}.&#10;Períodos impagos:&#10;{deuda}&nro_socio=...&#10;&#10;Atentamente, Comisión CAT."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all font-medium custom-scrollbar"
                  />
                </div>

                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-2">
                  <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500">Variables Disponibles:</span>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="bg-zinc-800 text-amber-500 px-2 py-1 rounded font-mono">{"{nombre}"}</span>
                    <span className="bg-zinc-800 text-amber-500 px-2 py-1 rounded font-mono">{"{nro_socio}"}</span>
                    <span className="bg-zinc-800 text-amber-500 px-2 py-1 rounded font-mono">{"{estado}"}</span>
                    <span className="bg-zinc-800 text-amber-500 px-2 py-1 rounded font-mono">{"{deuda}"}</span>
                    <span className="bg-zinc-800 text-amber-500 px-2 py-1 rounded font-mono">{"{deuda_texto}"}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 p-5 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Enviando Lote...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Enviar Mensajes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
