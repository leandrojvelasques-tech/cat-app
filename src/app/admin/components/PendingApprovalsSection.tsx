"use client"

import { useState } from "react"
import { approveEnrollmentRequest, rejectEnrollmentRequest } from "@/app/actions/enrollment"
import { updatePaymentStatus } from "@/app/actions/registraciones"
import { ApproveFeePaymentButton } from "../cuotas/ApproveFeePaymentButton"
import { Check, X, FileText, User, Phone, Mail, Calendar, Loader2, ExternalLink, CreditCard, Ticket, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface PendingEnrollment {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dni: string
  birthDate: Date
  address: string
  comment: string | null
  paymentProofUrl: string
  createdAt: Date
}

interface PendingFee {
  id: string
  periodYear: number
  periodMonth: number
  amountPaid: number
  notes: string | null
  paymentStatus: string
  createdAt: Date
  member: {
    id: string
    memberNumber: string
    firstName: string
    lastName: string
    dni: string
  }
}

interface PendingEventReg {
  id: string
  eventId: string
  firstName: string
  lastName: string
  dni: string | null
  email: string | null
  phone: string | null
  registrationType: string
  amountPaid: number
  paymentStatus: string
  paymentProof: string | null
  createdAt: Date
  event: {
    title: string
  }
}

interface PendingApprovalsProps {
  enrollmentRequests: PendingEnrollment[]
  feePayments: PendingFee[]
  eventRegistrations: PendingEventReg[]
}

export function PendingApprovalsSection({
  enrollmentRequests: initialEnrollments,
  feePayments: initialFees,
  eventRegistrations: initialEvents
}: PendingApprovalsProps) {
  const [enrollments, setEnrollments] = useState<PendingEnrollment[]>(initialEnrollments)
  const [fees, setFees] = useState<PendingFee[]>(initialFees)
  const [events, setEvents] = useState<PendingEventReg[]>(initialEvents)
  
  const [activeTab, setActiveTab] = useState<"ALL" | "ENROLLMENTS" | "FEES" | "EVENTS">("ALL")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()

  const totalCount = enrollments.length + fees.length + events.length

  // Handlers para Inscripciones de Socios
  async function handleApproveEnrollment(id: string) {
    if (!confirm("¿Aprobar esta solicitud y dar de alta al socio? Se enviará correo con sus credenciales.")) return
    setProcessingId(id)
    try {
      const res = await approveEnrollmentRequest(id)
      if (res.success) {
        toast.success("Socio dado de alta exitosamente.")
        setEnrollments(prev => prev.filter(s => s.id !== id))
        router.refresh()
      } else {
        toast.error(res.error || "No se pudo procesar la aprobación.")
      }
    } catch {
      toast.error("Error al conectar con el servidor.")
    } finally {
      setProcessingId(null)
    }
  }

  async function handleRejectEnrollment(id: string) {
    if (!confirm("¿Rechazar esta solicitud de inscripción?")) return
    setProcessingId(id)
    try {
      const res = await rejectEnrollmentRequest(id)
      if (res.success) {
        toast.success("Solicitud rechazada.")
        setEnrollments(prev => prev.filter(s => s.id !== id))
        router.refresh()
      } else {
        toast.error(res.error || "No se pudo procesar el rechazo.")
      }
    } catch {
      toast.error("Error al conectar con el servidor.")
    } finally {
      setProcessingId(null)
    }
  }

  // Handler para Eventos
  async function handleApproveEventReg(regId: string, eventId: string, amount: number) {
    setProcessingId(regId)
    try {
      await updatePaymentStatus(regId, eventId, "PAID", amount)
      toast.success("Inscripción de evento aprobada y confirmada.")
      setEvents(prev => prev.filter(e => e.id !== regId))
      router.refresh()
    } catch {
      toast.error("Error al aprobar la inscripción al evento.")
    } finally {
      setProcessingId(null)
    }
  }

  if (totalCount === 0) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">¡Sin trámites pendientes!</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Todas las solicitudes de ingreso, pagos de cuotas e inscripciones a eventos están al día.</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          100% al día
        </span>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-amber-500/10 via-zinc-900/60 to-zinc-900/40 border border-amber-500/30 p-6 md:p-8 rounded-[36px] backdrop-blur-md space-y-6 shadow-2xl">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Gestiones Pendientes de Aprobación
            </h2>
            <span className="bg-amber-500 text-zinc-950 text-xs font-black px-2.5 py-0.5 rounded-full">
              {totalCount}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Trámites recibidos desde el portal público y portal de socios que requieren revisión y validación por Tesorería/Comisión.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "ALL" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Todas ({totalCount})
          </button>
          {enrollments.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("ENROLLMENTS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ENROLLMENTS" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              <User size={13} />
              <span>Altas ({enrollments.length})</span>
            </button>
          )}
          {fees.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("FEES")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "FEES" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              <CreditCard size={13} />
              <span>Cuotas ({fees.length})</span>
            </button>
          )}
          {events.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("EVENTS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "EVENTS" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Ticket size={13} />
              <span>Eventos ({events.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {/* 1. SECCIÓN: SOLICITUDES DE INSCRIPCIÓN / ALTAS DE SOCIOS */}
        {(activeTab === "ALL" || activeTab === "ENROLLMENTS") && enrollments.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <User size={14} /> Solicitudes de Alta de Socios ({enrollments.length})
            </div>
            <div className="grid grid-cols-1 gap-3">
              {enrollments.map((sol) => {
                const isProcessing = processingId === sol.id
                return (
                  <div
                    key={sol.id}
                    className="bg-black/50 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-all"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                          NUEVO SOCIO
                        </span>
                        <h4 className="text-base font-bold text-white">
                          {sol.lastName}, {sol.firstName}
                        </h4>
                        <span className="text-xs text-zinc-500 font-mono">DNI: {sol.dni}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-300">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail size={13} className="text-zinc-500 shrink-0" />
                          <span className="truncate">{sol.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-zinc-500 shrink-0" />
                          <span>{sol.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-zinc-500 shrink-0" />
                          <span>Nac: {new Date(sol.birthDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 bg-white/5 p-2 rounded-xl border border-white/5">
                        <strong>Dirección:</strong> {sol.address}
                        {sol.comment && <span className="italic ml-2">"{sol.comment}"</span>}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(sol.paymentProofUrl)}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <FileText size={14} className="text-amber-400" />
                        <span>Ver Comprobante</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRejectEnrollment(sol.id)}
                        className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <X size={14} />}
                        <span>Rechazar</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApproveEnrollment(sol.id)}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                        <span>Aprobar Alta</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 2. SECCIÓN: COMPROBANTES DE CUOTAS SOCIALES */}
        {(activeTab === "ALL" || activeTab === "FEES") && fees.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <CreditCard size={14} /> Pagos de Cuotas Sociales en Verificación ({fees.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fees.map((fee) => (
                <div key={fee.id} className="bg-black/50 border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-sm font-bold text-white break-words">
                        {fee.member.lastName}, {fee.member.firstName}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono">#{fee.member.memberNumber}</span>
                    </div>
                    <p className="text-xs text-amber-400 font-bold">
                      Cuota {fee.periodMonth}/{fee.periodYear} — ${fee.amountPaid.toLocaleString("es-AR")}
                    </p>
                  </div>
                  <ApproveFeePaymentButton
                    feeId={fee.id}
                    amount={fee.amountPaid}
                    notes={fee.notes}
                    currentStatus={fee.paymentStatus}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SECCIÓN: INSCRIPCIONES A EVENTOS */}
        {(activeTab === "ALL" || activeTab === "EVENTS") && events.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Ticket size={14} /> Inscripciones a Eventos Pendientes ({events.length})
              </div>
              <Link href="/admin/eventos" className="text-xs text-amber-400 hover:underline font-bold">
                Ver todos los eventos →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.map((reg) => {
                const isProcessing = processingId === reg.id
                return (
                  <div key={reg.id} className="bg-black/50 border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between gap-3 transition-all">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {reg.firstName} {reg.lastName}
                      </p>
                      <p className="text-[10px] text-amber-400 font-medium truncate">
                        Evento: {reg.event.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Tipo: {reg.registrationType} — Total: ${reg.amountPaid.toLocaleString("es-AR")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {reg.paymentProof && (
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(reg.paymentProof)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 text-xs border border-white/10 transition-colors cursor-pointer"
                          title="Ver Comprobante"
                        >
                          <FileText size={13} className="text-amber-400" />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApproveEventReg(reg.id, reg.eventId, reg.amountPaid)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-black uppercase rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        <span>Aprobar</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Previsualizador de Comprobante Segura */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewUrl(null)
          }}
        >
          <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-4xl w-full flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[92vh]">
            <div className="flex justify-between items-center bg-zinc-950 p-4 px-6 border-b border-white/10 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileText size={16} className="text-amber-500" /> Previsualización de Comprobante
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  <ExternalLink size={13} />
                  <span>Pantalla Completa</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-black/60 overflow-y-auto flex-1 min-h-[350px]">
              {previewUrl.startsWith("data:application/pdf") || previewUrl.toLowerCase().endsWith(".pdf") ? (
                <object
                  data={previewUrl}
                  type="application/pdf"
                  className="w-full h-[58vh] min-h-[400px] rounded-xl border border-white/10"
                >
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3">
                    <FileText size={40} className="text-amber-400" />
                    <p className="text-xs text-zinc-300 font-medium">Documento PDF</p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-amber-500 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                    >
                      <ExternalLink size={14} /> Abrir PDF
                    </a>
                  </div>
                </object>
              ) : (
                <img
                  src={previewUrl}
                  alt="Comprobante"
                  className="max-w-full max-h-[65vh] object-contain rounded-xl border border-white/10 shadow-lg"
                />
              )}
            </div>
            <div className="p-4 bg-zinc-950 border-t border-white/10 flex justify-between items-center">
              <a
                href={previewUrl}
                download="comprobante.png"
                className="text-xs text-zinc-400 hover:text-white font-medium"
              >
                Descargar Copia
              </a>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
