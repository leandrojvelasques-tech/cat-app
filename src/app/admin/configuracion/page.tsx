import { db } from "@/lib/db"
import { Shield, Mail, Calendar, Bell, Users, Save, ShieldCheck, Crown, User, Key, ShoppingBag, Pencil, Plus, Trash2, BadgeInfo, TrendingUp } from "lucide-react"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { addBoardMember, removeBoardMember } from "@/app/actions/comision"
import { getFeeHistory, FeePeriod } from "@/lib/fee-utils"
import { getAuditLogs, recordAuditLog } from "@/lib/audit-utils"

async function getSetting(key: string, defaultValue: string = "") {
  const setting = await db.setting.findUnique({ where: { key } })
  return setting?.value || defaultValue
}

async function updateSetting(formData: FormData) {
  "use server"
  const session = await auth()
  const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
  if (!session || !allowedRoles.includes(session.user.role)) {
    throw new Error("No autorizado")
  }
  const entries = Array.from(formData.entries())
  
  for (const [key, value] of entries) {
    if (typeof value === 'string' && !key.startsWith('$')) {
      await db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      })
    }
  }

  await recordAuditLog(
    session.user,
    "Actualización de Parámetros y Plantillas de Email",
    "Se guardaron ajustes generales del sistema"
  )

  revalidatePath("/admin/configuracion")
}

async function addFeePeriod(formData: FormData) {
  "use server"
  const session = await auth()
  const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
  if (!session || !allowedRoles.includes(session.user.role)) {
    throw new Error("No autorizado")
  }
  const yearFrom = parseInt(formData.get("yearFrom") as string, 10)
  const monthFrom = parseInt(formData.get("monthFrom") as string, 10)
  const yearToRaw = formData.get("yearTo") as string
  const monthToRaw = formData.get("monthTo") as string
  const amount = parseFloat(formData.get("amount") as string)
  const description = formData.get("description") as string || ""

  const yearTo = yearToRaw ? parseInt(yearToRaw, 10) : null
  const monthTo = monthToRaw ? parseInt(monthToRaw, 10) : null

  const currentHistory = await getFeeHistory()
  const newPeriod: FeePeriod = {
    id: `period-${Date.now()}`,
    yearFrom,
    monthFrom,
    yearTo,
    monthTo,
    amount,
    description
  }

  const updatedHistory = [...currentHistory, newPeriod]
  await db.setting.upsert({
    where: { key: "historial_cuotas" },
    update: { value: JSON.stringify(updatedHistory) },
    create: { key: "historial_cuotas", value: JSON.stringify(updatedHistory) }
  })

  // Update cuota_mensual setting to latest amount
  await db.setting.upsert({
    where: { key: "cuota_mensual" },
    update: { value: String(amount) },
    create: { key: "cuota_mensual", value: String(amount) }
  })

  await recordAuditLog(
    session.user,
    `Nuevo Tramo de Cuota Social: $${amount.toLocaleString('es-AR')}`,
    `Vigencia desde ${monthFrom}/${yearFrom}${description ? ` (${description})` : ''}`
  )

  revalidatePath("/admin/configuracion")
}

async function deleteFeePeriod(id: string) {
  "use server"
  const session = await auth()
  const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
  if (!session || !allowedRoles.includes(session.user.role)) {
    throw new Error("No autorizado")
  }
  const currentHistory = await getFeeHistory()
  const periodToDelete = currentHistory.find(p => p.id === id)
  const updatedHistory = currentHistory.filter(p => p.id !== id)
  
  await db.setting.upsert({
    where: { key: "historial_cuotas" },
    update: { value: JSON.stringify(updatedHistory) },
    create: { key: "historial_cuotas", value: JSON.stringify(updatedHistory) }
  })

  await recordAuditLog(
    session.user,
    `Eliminación de Tramo de Cuota Social`,
    periodToDelete ? `Eliminado tramo de $${periodToDelete.amount}` : "Eliminado tramo"
  )

  revalidatePath("/admin/configuracion")
}

// Role permission definitions shown in the UI
const ROLE_PERMISSIONS = [
  {
    role: "SUPERADMIN",
    label: "Super Admin",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    dotColor: "bg-red-500",
    description: "Acceso total al sistema. Puede crear, editar y eliminar usuarios y accesos de administrador. Sin restricciones.",
    permissions: [
      "Gestionar todos los usuarios del sistema",
      "Dar de alta y baja socios con o sin aprobación",
      "Configurar todos los parámetros del sistema",
      "Acceso completo a cobranzas, eventos y reportes",
    ],
  },
  {
    role: "PRESIDENT",
    label: "Presidente / Vicepresidente",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    dotColor: "bg-amber-500",
    description: "Máxima autoridad de la comisión. Pueden redesignar roles dentro de la junta y autorizar bajas de socios.",
    permissions: [
      "Autorizar bajas de socios (fallecimiento, renuncia, etc.)",
      "Redesignar cargos de la comisión directiva",
      "Cobrar cuotas y registrar pagos de eventos",
      "Crear y gestionar eventos",
      "Suspender socios temporalmente",
    ],
  },
  {
    role: "BOARD",
    label: "Comisión Directiva",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    dotColor: "bg-blue-500",
    description: "Miembros activos de la comisión. Pueden operar el sistema pero no autorizar bajas ni redesignar roles.",
    permissions: [
      "Cobrar cuotas y registrar pagos",
      "Crear y editar eventos",
      "Registrar solicitudes de baja (quedan pendientes de aprobación)",
      "Ver historial completo de cobranzas",
      "Acceder a directorio de socios",
    ],
  },
]

export default async function SettingsPage() {
  const session = await auth()
  const allowedRoles = ["ADMIN", "SUPERADMIN", "BOARD", "PRESIDENT"]
  if (!session || !allowedRoles.includes(session.user.role)) {
    redirect("/admin")
  }

  // Fetch settings or use defaults
  const cuotaMensual = await getSetting("cuota_mensual", "6000")
  const vencimientoDia = await getSetting("vencimiento_dia", "10")
  const envioDia = await getSetting("envio_dia", "1")
  const recordatorioDia = await getSetting("recordatorio_dia", "5")
  const emailAdmin = await getSetting("email_admin", "centroamigosdeltango@gmail.com")
  const feeHistory = await getFeeHistory()
  const auditLogs = await getAuditLogs()
  
  const msgRecordatorio = await getSetting("msg_recordatorio", "Estimado socio, le recordamos que su cuota del mes está próxima a vencer. ¡Gracias por su colaboración!")
  const msgVencida = await getSetting("msg_vencida", "Estimado socio, su cuota registra una demora. Le agradeceríamos regularizar su situación para seguir apoyando al Centro.")
  
  const msgPagoCuota = await getSetting("msg_pago_confirmado_cuota", "¡Gracias por su pago! Su comprobante ha sido registrado. Estado de cuenta: {estado}.")
  const msgPagoEvento = await getSetting("msg_pago_confirmado_evento", "¡Gracias por acompañarnos! Confirmamos la recepción de su pago para el evento: {evento}.")
  const msgBienvenida = await getSetting("msg_bienvenida", "¡Bienvenido/a {nombre} al Centro Amigos del Tango! 💃\n\n📌 Tu número de socio es: #{socio}\n\nUsuario de acceso: {username}\nClave temporal: {password}\n\n¡Nos vemos pronto en la pista!")
  const msgSolicitudInscripcion = await getSetting("msg_solicitud_inscripcion", "¡Hola {nombre}!\n\nAgradecemos tu interés en formar parte del Centro Amigos del Tango.\n\nQueremos confirmarte que hemos recibido tu solicitud de inscripción y el comprobante de pago de tu primera cuota social.\n\nNuestra área de Tesorería verificará la información a la brevedad. Una vez aprobada tu alta, recibirás un nuevo correo electrónico con tu número de socio asignado y tus datos de acceso al Portal de Socios.\n\n¡Esperamos vernos pronto en la pista!")
  const msgMora = await getSetting("msg_mora", "Lamentamos informarle que su cuenta registra una deuda de 3 o más períodos impagos y sus beneficios han quedado suspendidos.")
  const msgBaja = await getSetting("msg_baja", "Por la presente se le notifica que ha sido dado de baja del padrón de socios.")

  const mesesDeudaMora = await getSetting("meses_deuda_mora", "1")
  const mesesSuspension = await getSetting("meses_suspension", "3")

  // Board members with their linked members for avatar display
  const admins = await db.user.findMany({
    where: { role: { in: ["ADMIN", "BOARD", "SUPERADMIN"] } },
    include: {
      member: {
        select: { avatarUrl: true, firstName: true, lastName: true, memberNumber: true }
      }
    }
  })

  // 1. Integrantes actuales de la comisión directiva
  const currentBoard = await db.member.findMany({
    where: { isBoardMember: true },
    orderBy: { lastName: "asc" }
  })

  // 2. Socios elegibles para formar parte (activos y que no estén ya en la CD)
  const eligibleMembers = await db.member.findMany({
    where: { 
      isBoardMember: false,
      status: "ACTIVE"
    },
    orderBy: { lastName: "asc" }
  })

  // 3. Obtener el historial completo de la CD
  const boardHistory = await db.boardHistory.findMany({
    include: {
      member: {
        select: { firstName: true, lastName: true, avatarUrl: true, memberNumber: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  })

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white/90">Ajustes del Sistema</h1>
        <p className="text-zinc-400 mt-1">Configure parámetros, permisos y comunicaciones automáticas.</p>
      </div>

      <form action={updateSetting} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Parametros Generales */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Calendar className="text-amber-500" size={20} />
            <h2 className="text-lg font-medium">Cuotas y Vencimientos</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Importe Cuota ($)</label>
              <input 
                name="cuota_mensual"
                type="number" 
                defaultValue={cuotaMensual}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-amber-500/50 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Email Admin</label>
              <input 
                name="email_admin"
                type="email" 
                defaultValue={emailAdmin}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-amber-500/50 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Día Envío</label>
              <input 
                name="envio_dia"
                type="number" 
                max="28" 
                defaultValue={envioDia}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-amber-500/50 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Día Vencimiento</label>
              <input 
                name="vencimiento_dia"
                type="number" 
                max="28" 
                defaultValue={vencimientoDia}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-amber-500/50 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Día Recordatorio</label>
              <input 
                name="recordatorio_dia"
                type="number" 
                max="28" 
                defaultValue={recordatorioDia}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-amber-500/50 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Historial de Cuotas por Período */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-amber-500" size={20} />
              <div>
                <h2 className="text-lg font-medium text-white">Historial de Valores de Cuota Social</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Registre variaciones de tarifa y montos vigentes por período.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tabla de Períodos Vigentes */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Tramos Tarifarios Registrados</h3>
              <div className="space-y-2">
                {feeHistory.map((period) => {
                  const isCurrent = !period.yearTo
                  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
                  const fromStr = `${monthNames[period.monthFrom - 1]} ${period.yearFrom}`
                  const toStr = period.yearTo && period.monthTo ? `${monthNames[period.monthTo - 1]} ${period.yearTo}` : "En adelante"

                  return (
                    <div 
                      key={period.id}
                      className="bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border ${isCurrent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-white/5 text-zinc-400'}`}>
                          <TrendingUp size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-base">${period.amount.toLocaleString('es-AR')}</span>
                            <span className="text-xs text-zinc-400 font-medium">(Pareja 50%: ${(period.amount / 2).toLocaleString('es-AR')})</span>
                            {isCurrent && (
                              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                Vigente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            Vigencia: <strong className="text-zinc-200">{fromStr}</strong> a <strong className="text-zinc-200">{toStr}</strong>
                            {period.description && <span className="ml-2 italic text-zinc-500">({period.description})</span>}
                          </p>
                        </div>
                      </div>

                      <form action={async () => {
                        "use server"
                        await deleteFeePeriod(period.id)
                      }}>
                        <button
                          type="submit"
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                          title="Eliminar tramo tarifario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Formulario para Agregar Nuevo Aumento/Período */}
            <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Plus size={14} /> Registrar Nuevo Aumento / Período
              </h3>
              
              <form action={addFeePeriod} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Mes Inicio *</label>
                    <select name="monthFrom" defaultValue="7" required className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white">
                      <option value="1">Enero</option>
                      <option value="2">Febrero</option>
                      <option value="3">Marzo</option>
                      <option value="4">Abril</option>
                      <option value="5">Mayo</option>
                      <option value="6">Junio</option>
                      <option value="7">Julio</option>
                      <option value="8">Agosto</option>
                      <option value="9">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Año Inicio *</label>
                    <input name="yearFrom" type="number" defaultValue={2026} required className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Mes Fin (Opcional)</label>
                    <select name="monthTo" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white">
                      <option value="">Hasta nuevo aviso</option>
                      <option value="1">Enero</option>
                      <option value="2">Febrero</option>
                      <option value="3">Marzo</option>
                      <option value="4">Abril</option>
                      <option value="5">Mayo</option>
                      <option value="6">Junio</option>
                      <option value="7">Julio</option>
                      <option value="8">Agosto</option>
                      <option value="9">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase font-bold">Año Fin (Opcional)</label>
                    <input name="yearTo" type="number" placeholder="Ej: 2026" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Monto Cuota Base ($) *</label>
                  <input name="amount" type="number" step="500" placeholder="Ej: 7000" defaultValue={7000} required className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold" />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Descripción / Nota</label>
                  <input name="description" type="text" placeholder="Ej: Aumento Julio" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>

                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-900/20">
                  + Guardar Tramo Tarifario
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Reglas de Estado */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Shield className="text-amber-500" size={20} />
            <h2 className="text-lg font-medium">Reglas de Estado</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-medium">Deudor automático</p>
                <p className="text-xs text-zinc-500">Meses impagos para pasar a deuda</p>
              </div>
              <input 
                name="meses_deuda_mora"
                type="number" 
                defaultValue={mesesDeudaMora}
                className="w-16 bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-center text-white"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-medium">Suspención automática</p>
                <p className="text-xs text-zinc-500">Meses impagos para suspender ficha</p>
              </div>
              <input 
                name="meses_suspension"
                type="number" 
                defaultValue={mesesSuspension}
                className="w-16 bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-center text-white"
              />
            </div>
          </div>
        </section>

        {/* Textos de Email */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Mail className="text-amber-500" size={20} />
            <h2 className="text-lg font-medium">Plantillas de Email</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Recordatorio Vencimiento</label>
                <textarea 
                  name="msg_recordatorio"
                  defaultValue={msgRecordatorio}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:border-amber-500/50 outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Cuota Vencida</label>
                <textarea 
                  name="msg_vencida"
                  defaultValue={msgVencida}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:border-amber-500/50 outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Solicitud de Inscripción Recibida</label>
                <textarea 
                  name="msg_solicitud_inscripcion"
                  defaultValue={msgSolicitudInscripcion}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:border-amber-500/50 outline-none text-sm"
                />
                <p className="text-[9px] text-zinc-600 uppercase font-black italic">Variables: {'{nombre}'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Notificación de Baja de Socio</label>
                <textarea 
                  name="msg_baja"
                  defaultValue={msgBaja}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:border-amber-500/50 outline-none text-sm"
                />
                <p className="text-[9px] text-zinc-600 uppercase font-black italic">Variables: {'{nombre}'}, {'{socio}'}, {'{fecha}'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Pago Confirmado (Cuota)</label>
                <textarea 
                  name="msg_pago_confirmado_cuota"
                  defaultValue={msgPagoCuota}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:border-amber-500/50 outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Pago Confirmado (Evento)</label>
                <textarea 
                  name="msg_pago_confirmado_evento"
                  defaultValue={msgPagoEvento}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:border-amber-500/50 outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Notificación de Morosidad (3 Impagos)</label>
                <textarea 
                  name="msg_mora"
                  defaultValue={msgMora}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:border-amber-500/50 outline-none text-sm"
                />
                <p className="text-[9px] text-zinc-600 uppercase font-black italic">Variables: {'{nombre}'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Mensaje de Bienvenida (Alta)</label>
                <textarea 
                  name="msg_bienvenida"
                  defaultValue={msgBienvenida}
                  rows={5}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:border-amber-500/50 outline-none text-sm"
                />
                <p className="text-[9px] text-zinc-600 uppercase font-black italic">Variables: {'{nombre}'}, {'{socio}'}, {'{username}'}, {'{password}'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Botón de Guardar Ajustes */}
        <div className="lg:col-span-2 flex justify-end pt-4">
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-amber-900/40 cursor-pointer"
          >
            <Save size={18} /> Guardar Todos los Ajustes
          </button>
        </div>
      </form>

      {/* ===== SECCIÓN COMISIÓN DIRECTIVA (EMBEBIDA) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-white/5 pt-8">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-semibold tracking-tight text-white/90 flex items-center gap-3">
            <Crown className="text-amber-500" size={24} />
            <span>Comisión Directiva</span>
          </h2>
          <p className="text-zinc-500 mt-1">Gestione los cargos institucionales vigentes y el historial de comisiones del centro.</p>
        </div>

        {/* Listado de Miembros Activos en la CD y Historial */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Users className="text-amber-500" size={18} />
              <span>Miembros Activos de la CD</span>
            </h3>

            {currentBoard.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 italic">
                No hay miembros asignados a la comisión directiva actualmente.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentBoard.map((member) => (
                  <div 
                    key={member.id}
                    className="bg-black/20 border border-white/5 rounded-2xl p-4 flex justify-between items-center gap-4 hover:border-amber-500/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/5 rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-zinc-400 text-xs font-bold">{member.firstName[0]}{member.lastName[0]}</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-zinc-200 truncate group-hover:text-amber-500 transition-colors">
                          {member.lastName}, {member.firstName}
                        </span>
                        <span className="text-xs text-amber-500 font-medium mt-0.5">{member.position}</span>
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">Socio #{member.memberNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link 
                        href={`/admin/comision/${member.id}/editar`}
                        className="p-2 bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-white rounded-xl border border-amber-500/10 transition-all"
                        title="Editar miembro de la Comisión Directiva"
                      >
                        <Pencil size={16} />
                      </Link>

                      <form action={async () => {
                        "use server"
                        await removeBoardMember(member.id)
                      }}>
                        <button 
                          type="submit"
                          className="p-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl border border-red-500/10 transition-all cursor-pointer"
                          title="Remover de la Comisión Directiva"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial Reciente */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="text-zinc-400" size={18} />
              <span>Historial Reciente (Últimos Movimientos)</span>
            </h3>

            <div className="space-y-3">
              {boardHistory.map((hist) => (
                <div 
                  key={hist.id} 
                  className="bg-black/10 rounded-xl p-3 border border-white/5 flex justify-between items-center gap-4 text-xs text-zinc-400"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/5 bg-zinc-800 flex items-center justify-center text-[10px]">
                      {hist.member.avatarUrl ? (
                        <img src={hist.member.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{hist.member.firstName[0]}{hist.member.lastName[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-300">{hist.member.lastName}, {hist.member.firstName} <span className="text-[10px] text-zinc-500 font-normal">#{hist.member.memberNumber}</span></p>
                      <p className="text-zinc-500 font-medium">{hist.position} ({hist.periodStart} - {hist.periodEnd || "Presente"})</p>
                    </div>
                  </div>
                  {hist.notes && (
                    <span className="text-[10px] text-zinc-600 italic truncate max-w-[200px]" title={hist.notes}>
                      {hist.notes}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulario para Agregar Miembro a la CD */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-amber-500" size={18} />
              <span>Asignar Integrante</span>
            </h3>

            <form action={addBoardMember} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Socio Activo *</label>
                <select 
                  name="memberId"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Seleccione un socio...</option>
                  {eligibleMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.lastName}, {m.firstName} (#{m.memberNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Cargo / Función *</label>
                <select 
                  name="position"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Seleccione un cargo...</option>
                  <option value="Presidente">Presidente</option>
                  <option value="Vicepresidente">Vicepresidente</option>
                  <option value="Vice Presidente">Vice Presidente</option>
                  <option value="Secretario">Secretario</option>
                  <option value="Secretaria">Secretaria</option>
                  <option value="Tesorero">Tesorero</option>
                  <option value="Primer Vocal">Primer Vocal</option>
                  <option value="1er Vocal">1er Vocal</option>
                  <option value="Segundo Vocal">Segundo Vocal</option>
                  <option value="2do Vocal">2do Vocal</option>
                  <option value="Tercer Vocal">Tercer Vocal</option>
                  <option value="3er Vocal">3er Vocal</option>
                  <option value="1er Vocal Suplente">1er Vocal Suplente</option>
                  <option value="2do Vocal Suplente">2do Vocal Suplente</option>
                  <option value="Vocal">Vocal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Año de Inicio *</label>
                  <input 
                    name="periodStart"
                    required
                    type="number"
                    defaultValue={new Date().getFullYear()}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Año de Fin</label>
                  <input 
                    name="periodEnd"
                    type="number"
                    placeholder="Opcional"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 uppercase font-black tracking-wider">Observaciones</label>
                <textarea 
                  name="notes" 
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/10 mt-4 cursor-pointer"
              >
                Agregar miembro
              </button>
            </form>
          </div>

          <div className="bg-amber-600/10 border border-amber-500/20 rounded-3xl p-5 flex gap-3 text-xs text-zinc-400">
            <BadgeInfo className="text-amber-500 shrink-0 mt-0.5" size={16} />
            <div className="space-y-1">
              <p className="font-bold text-white uppercase tracking-wider">Acceso al Panel</p>
              <p>Al asignar un integrante a la Comisión Directiva, recuerde crearle una cuenta de usuario con rol **BOARD** o **ADMIN** para que pueda acceder y operar el Panel Administrativo.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN USUARIOS DEL SISTEMA ===== */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6 text-zinc-400 border-t border-white/5 pt-8">
         <div className="flex items-center justify-between border-b border-white/5 pb-4">
           <div className="flex items-center gap-3">
             <Users className="text-amber-500" size={20} />
             <h2 className="text-lg font-medium text-white">Usuarios del Sistema</h2>
           </div>
           <Link href="/admin/configuracion/usuarios/nuevo" className="text-xs bg-amber-600/10 text-amber-500 px-3 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-600/20 transition-colors">
             + Agregar Usuario
           </Link>
         </div>

         <div className="space-y-2">
           {admins.map(admin => {
             const avatarUrl = admin.member?.avatarUrl
             const initials = (admin.name || admin.email)[0].toUpperCase()
             return (
               <div key={admin.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-amber-500/20 flex items-center justify-center">
                     {avatarUrl ? (
                       <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-amber-500 text-sm font-black">{initials}</span>
                     )}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm text-zinc-300 font-bold">{admin.name || admin.email.split('@')[0]}</span>
                     <span className="text-xs text-zinc-500">{admin.email}</span>
                     {admin.member && (
                       <span className="text-[9px] text-amber-500/60 font-black uppercase tracking-widest">
                         Socio #{admin.member.memberNumber}
                       </span>
                     )}
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex gap-1 items-center">
                      <span className={`w-2 h-2 rounded-full ${admin.role === 'ADMIN' || admin.role === 'SUPERADMIN' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                      <span className="text-[10px] text-zinc-500 uppercase">{admin.position || admin.role}</span>
                   </div>
                   <Link
                     href={`/admin/usuarios/${admin.id}/editar`}
                     className="text-zinc-600 hover:text-amber-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                   >
                     Editar
                   </Link>
                </div>
               </div>
             )
           })}
         </div>
      </section>

      {/* ===== HISTORIAL DE AUDITORÍA DE CAMBIOS ===== */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <ShieldCheck className="text-amber-500" size={20} />
          <div>
            <h2 className="text-lg font-medium text-white">Historial de Auditoría de Cambios</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Registro de modificaciones realizadas por integrantes de la comisión</p>
          </div>
        </div>
        
        {auditLogs.length === 0 ? (
          <p className="text-xs text-zinc-500 italic text-center py-6">No hay registros de auditoría almacenados aún.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {log.userName[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-200">{log.userName}</span>
                      <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono uppercase">{log.userRole}</span>
                    </div>
                    <p className="text-zinc-400 mt-0.5 font-medium">{log.action}</p>
                    {log.details && <p className="text-zinc-500 text-[11px] italic">{log.details}</p>}
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== GESTIÓN DE USUARIOS (PERMISOS POR ROL) ===== */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-amber-500" size={20} />
            <div>
              <h2 className="text-lg font-medium text-white">Permisos de Usuario</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Niveles de acceso y funcionalidades por rol</p>
            </div>
          </div>
          <Link
            href="/admin/usuarios"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-900/30"
          >
            <Key size={14} /> Administrar Accesos
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLE_PERMISSIONS.map((rp) => (
            <div
              key={rp.role}
              className={`rounded-2xl p-5 border ${rp.bgColor} ${rp.borderColor} space-y-3`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${rp.dotColor}`}></span>
                <h3 className={`text-xs font-black uppercase tracking-widest ${rp.color}`}>{rp.label}</h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{rp.description}</p>
              <ul className="space-y-1.5">
                {rp.permissions.map((perm, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-zinc-500">
                    <span className={`mt-0.5 w-1 h-1 rounded-full ${rp.dotColor} shrink-0`}></span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
