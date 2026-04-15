import { db } from "@/lib/db"
import { Shield, Mail, Calendar, Bell, Users, Save, ShieldCheck, Crown, User, Key, ShoppingBag } from "lucide-react"
import { revalidatePath } from "next/cache"
import Link from "next/link"

async function getSetting(key: string, defaultValue: string = "") {
  const setting = await db.setting.findUnique({ where: { key } })
  return setting?.value || defaultValue
}

async function updateSetting(formData: FormData) {
  "use server"
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
  // Fetch settings or use defaults
  const cuotaMensual = await getSetting("cuota_mensual", "6000")
  const vencimientoDia = await getSetting("vencimiento_dia", "10")
  const envioDia = await getSetting("envio_dia", "1")
  const recordatorioDia = await getSetting("recordatorio_dia", "5")
  const emailAdmin = await getSetting("email_admin", "centroamigosdeltango@gmail.com")
  
  const msgRecordatorio = await getSetting("msg_recordatorio", "Estimado socio, le recordamos que su cuota del mes está próxima a vencer. ¡Gracias por su colaboración!")
  const msgVencida = await getSetting("msg_vencida", "Estimado socio, su cuota registra una demora. Le agradeceríamos regularizar su situación para seguir apoyando al Centro.")
  
  const msgPagoCuota = await getSetting("msg_pago_confirmado_cuota", "¡Gracias por su pago! Su comprobante ha sido registrado. Estado de cuenta: {estado}.")
  const msgPagoEvento = await getSetting("msg_pago_confirmado_evento", "¡Gracias por acompañarnos! Confirmamos la recepción de su pago para el evento: {evento}.")
  const msgBienvenida = await getSetting("msg_bienvenida", "¡Bienvenido/a {nombre} al Centro Amigos del Tango! 💃🕺\n\nEs un gran placer darte la bienvenida como socio/a de nuestra querida casa de tango.\nTu ficha ha sido procesada con éxito y ya formas parte de nuestra comunidad oficial.\n\n📌 Tu número de socio es: #{socio}\n\n💬 Te invitamos a participar de nuestras milongas, clases y seminarios.\n¡Nos vemos pronto en la pista!")

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
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Mensaje de Bienvenida</label>
                <textarea 
                  name="msg_bienvenida"
                  defaultValue={msgBienvenida}
                  rows={6}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:border-amber-500/50 outline-none text-sm"
                />
                <p className="text-[9px] text-zinc-600 uppercase font-black italic">Variables: {'{nombre}'}, {'{socio}'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comision Directiva — with avatars */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md lg:col-span-2 space-y-6 text-zinc-400">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
               <Users className="text-amber-500" size={20} />
               <h2 className="text-lg font-medium text-white">Comisión Directiva (Accesos Admin)</h2>
             </div>
             <Link href="/admin/configuracion/usuarios/nuevo" className="text-xs bg-amber-600/10 text-amber-500 px-3 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-600/20 transition-colors">
               + Agregar Usuario
             </Link>
           </div>

           <div className="space-y-2">
             {admins.map(admin => {
               // Show member avatar if linked member has one, otherwise show initials
               const avatarUrl = admin.member?.avatarUrl
               const initials = (admin.name || admin.email)[0].toUpperCase()
               return (
                 <div key={admin.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                     {/* Avatar: photo if available, else colored initials */}
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
                       href={`/admin/usuarios`}
                       className="text-zinc-600 hover:text-amber-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                     >
                       Gestionar
                     </Link>
                  </div>
                 </div>
               )
             })}
           </div>
        </section>

        {/* Global Save */}
        <div className="lg:col-span-2 flex justify-end pt-4">
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-amber-900/40"
          >
            <Save size={18} /> Guardar Todos los Cambios
          </button>
        </div>

      </form>

      {/* ===== MODULOS ADICIONALES ===== */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <ShoppingBag className="text-amber-500" size={20} />
          <div>
            <h2 className="text-lg font-medium text-white">Módulos del Sistema</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Gestión de datos para funciones satélites</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/buffet"
            className="flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 border border-white/5 hover:border-amber-500/30 rounded-2xl transition-all group"
          >
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">Catálogo Buffet</p>
              <p className="text-xs text-zinc-500 mt-1">Administra los productos, precios y categorías disponibles en los eventos.</p>
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingBag size={18} />
            </div>
          </Link>
        </div>
      </section>

      {/* ===== USUARIOS DEL SISTEMA (moved here from /admin/usuarios) ===== */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-amber-500" size={20} />
            <div>
              <h2 className="text-lg font-medium text-white">Gestión de Usuarios del Sistema</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Usuarios con acceso al panel de administración</p>
            </div>
          </div>
          <Link
            href="/admin/usuarios"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-900/30"
          >
            <Key size={14} /> Administrar Accesos
          </Link>
        </div>

        {/* Permission cards per role */}
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
