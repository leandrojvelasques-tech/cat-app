"use client"

import { useState, useEffect } from "react"
import { registerAttendee } from "@/app/actions/registraciones"
import { Search, User, CreditCard, Save, X, Trash2, CheckCircle2, AlertCircle, Plus } from "lucide-react"

interface Member {
  id: string
  firstName: string
  lastName: string
  dni: string
  email: string | null
  phone: string | null
  status: string
}

export function RegistrationModal({ event, onClose }: { event: any, onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmedDuplicate, setConfirmedDuplicate] = useState(false)
  
  // Manual form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    phone: "",
    registrationType: event.type === 'MILONGA' ? 'MILONGA' : (event.type === 'WORKSHOP' ? 'WORKSHOP' : 'FULL'),
    amountPaid: event.type === 'MILONGA' ? (event.priceNonSocioMilonga || 0) : (event.type === 'WORKSHOP' ? (event.priceNonSocioWorkshop || 0) : (event.priceNonSocioFull || 0)),
    paymentMethod: "CASH",
    paymentStatus: "PAID"
  })

  const hasDuplicate = event.registrations.some((r: any) => 
    (r.dni && r.dni.trim() !== "" && r.dni === formData.dni) || 
    (r.firstName.toLowerCase().trim() === formData.firstName.toLowerCase().trim() && 
     r.lastName.toLowerCase().trim() === formData.lastName.toLowerCase().trim())
  )

  useEffect(() => {
    if (searchTerm.length > 2) {
      setLoading(true)
      fetch(`/api/socios/search?q=${searchTerm}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data)
          setLoading(false)
        })
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const selectMember = (m: Member) => {
    setSelectedMember(m)
    setFormData({
      ...formData,
      firstName: m.firstName,
      lastName: m.lastName,
      dni: m.dni,
      email: m.email || "",
      phone: m.phone || "",
      amountPaid: getPrice(formData.registrationType, m.status === 'ACTIVE')
    })
    setSearchTerm("")
    setSearchResults([])
    setConfirmedDuplicate(false)
  }

  const getPrice = (type: string, isSocio: boolean) => {
    if (type === 'MILONGA') return isSocio ? (event.priceSocioMilonga || 0) : (event.priceNonSocioMilonga || 0)
    if (type === 'WORKSHOP') return isSocio ? (event.priceSocioWorkshop || 0) : (event.priceNonSocioWorkshop || 0)
    return isSocio ? (event.priceSocioFull || 0) : (event.priceNonSocioFull || 0)
  }

  const handleTypeChange = (type: string) => {
    const isSocio = selectedMember?.status === 'ACTIVE'
    const price = getPrice(type, isSocio)
    setFormData(prev => ({ ...prev, registrationType: type, amountPaid: price }))
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-amber-600/10 to-transparent">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Plus size={20} className="text-amber-500" /> Registrar Asistente
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>

        <form action={async (fd) => {
           setLoading(true);
           const result = await registerAttendee(fd);
           setLoading(false);
           if (result?.error) {
             alert(result.error);
             return;
           }
           onClose();
        }} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          <input type="hidden" name="eventId" value={event.id} />
          <input type="hidden" name="memberId" value={selectedMember?.id || ""} />

          {/* Member Search */}
          <div className="relative space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">¿Es Socio del CAT?</label>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
               <input 
                placeholder="Busque por nombre o DNI..." 
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-amber-500/50 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
               />
               {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />}
            </div>

            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full top-full mt-2 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {searchResults.map(m => (
                  <button 
                    key={m.id}
                    type="button" 
                    onClick={() => selectMember(m)}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between group transition-colors border-b border-white/5 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-amber-500">{m.firstName} {m.lastName}</div>
                      <div className="text-[10px] text-zinc-500">DNI: {m.dni}</div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">SOCIO ACTIVO</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedMember && (
            <div className="flex items-center justify-between bg-amber-600/10 border border-amber-600/20 rounded-2xl p-4 animate-in fade-in duration-300">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-full text-amber-500"><User size={20} /></div>
                  <div>
                    <div className="text-sm font-bold text-amber-500">{selectedMember.firstName} {selectedMember.lastName}</div>
                    <div className="text-[10px] text-amber-600/60 uppercase font-bold">Inscripción con Tarifa Socio</div>
                  </div>
               </div>
               <button type="button" onClick={() => setSelectedMember(null)} className="text-[10px] text-zinc-500 hover:text-white underline">CAMBIAR</button>
            </div>
          )}

          {/* Form Fields */}
          {!selectedMember && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Nombre</label>
                <input 
                  name="firstName" 
                  required 
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({...formData, firstName: e.target.value});
                    setConfirmedDuplicate(false);
                  }}
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-white/20 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Apellido</label>
                <input 
                  name="lastName" 
                  required 
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({...formData, lastName: e.target.value});
                    setConfirmedDuplicate(false);
                  }}
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-white/20 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">DNI / Pasaporte</label>
                <input 
                  name="dni" 
                  value={formData.dni}
                  onChange={(e) => {
                    setFormData({...formData, dni: e.target.value});
                    setConfirmedDuplicate(false);
                  }}
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-white/20 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Celular / WhatsApp</label>
                <input 
                  name="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:border-white/20 outline-none" 
                />
              </div>
            </div>
          )}

          {/* Invisible inputs shared with member data */}
          {selectedMember && (
            <>
              <input type="hidden" name="firstName" value={selectedMember.firstName} />
              <input type="hidden" name="lastName" value={selectedMember.lastName} />
              <input type="hidden" name="dni" value={selectedMember.dni} />
              <input type="hidden" name="phone" value={selectedMember.phone || ""} />
              <input type="hidden" name="email" value={selectedMember.email || ""} />
            </>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
             <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">¿A qué se inscribe?</label>
                 <div className="space-y-2">
                   {[
                     { id: 'MILONGA', label: 'Solo Milonga', visible: event.type !== 'WORKSHOP' },
                     { id: 'WORKSHOP', label: 'Solo Workshop', visible: event.type !== 'MILONGA' },
                     { id: 'FULL', label: 'Combo Full Pass', visible: event.type === 'BOTH' },
                   ].filter(o => o.visible).map(opt => (
                     <button 
                      key={opt.id}
                      type="button" 
                      onClick={() => handleTypeChange(opt.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-xs font-bold ${
                        formData.registrationType === opt.id 
                          ? "bg-amber-600/10 border-amber-600/40 text-amber-500" 
                          : "bg-black/20 border-white/5 text-zinc-500 hover:border-white/20"
                      }`}
                     >
                       {opt.label}
                       {formData.registrationType === opt.id && <CheckCircle2 size={14} />}
                     </button>
                   ))}
                   <input type="hidden" name="registrationType" value={formData.registrationType} />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Pago y Estado</label>
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-4">
                   <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs text-zinc-400">Importe sugerido</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px]">$</span>
                        <input 
                          name="amountPaid" 
                          type="number" 
                          value={formData.amountPaid}
                          onChange={(e) => setFormData({...formData, amountPaid: parseFloat(e.target.value) || 0})}
                          className="bg-zinc-900 border border-white/10 rounded-lg pl-5 pr-2 py-1 text-sm text-emerald-400 font-bold w-24 outline-none focus:border-emerald-500/50" 
                        />
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <CreditCard size={14} className="text-zinc-600" />
                         <select name="paymentMethod" className="bg-zinc-800 border border-white/10 rounded-lg text-xs text-zinc-200 px-2 py-1.5 outline-none w-full shadow-lg">
                            <option value="CASH" className="bg-zinc-800">Efectivo</option>
                            <option value="TRANSFER" className="bg-zinc-800">Transferencia / Alias</option>
                            <option value="MP" className="bg-zinc-800">Mercado Pago</option>
                         </select>
                      </div>
                      <div className="flex items-center gap-2">
                         <AlertCircle size={14} className="text-amber-500/50" />
                         <select name="paymentStatus" className="bg-zinc-800 border border-white/10 rounded-lg text-[10px] font-bold text-amber-500 uppercase px-2 py-1.5 outline-none w-full shadow-lg">
                            <option value="PAID" className="bg-zinc-800">YA PAGÓ</option>
                            <option value="PENDING" className="bg-zinc-800">PENDIENTE / RESERVA</option>
                         </select>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-white/5 space-y-2">
                       <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest pl-1">Comprobante de Pago</label>
                       <input
                         type="file"
                         name="paymentProof"
                         accept="image/*,.pdf"
                         className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-[10px] text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20"
                       />
                   </div>
                </div>
             </div>
          </div>

          {hasDuplicate && !confirmedDuplicate && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
               <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
               <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-red-500 uppercase tracking-tighter">¡Detección de Duplicado!</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Ya existe una persona registrada con este nombre o DNI en el evento. 
                      Por favor, verifica si es un error o si el asistente realmente desea adquirir otra entrada.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setConfirmedDuplicate(true)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20"
                  >
                    Deseo continuar igualmente
                  </button>
               </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={hasDuplicate && !confirmedDuplicate}
            className={`w-full font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group ${
              hasDuplicate && !confirmedDuplicate 
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5" 
                : "bg-amber-600 hover:bg-amber-500 text-white"
            }`}
          >
            <Save size={18} className="group-hover:scale-110 transition-transform" />
            {hasDuplicate && !confirmedDuplicate ? "VERIFICAR DUPLICADO" : "CONFIRMAR INSCRIPCIÓN"}
          </button>
        </form>
      </div>
    </div>
  )
}
