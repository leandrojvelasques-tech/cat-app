"use client"
import { useState, useEffect } from "react"
import { Users, Music, Search, ArrowRight, ArrowLeft, CreditCard, ChevronRight, CheckCircle2, Ticket, FileText, Upload, GraduationCap } from "lucide-react"

const TangoShoe = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
  >
    <path d="M4 11V18C4 18.55 4.45 19 5 19H19C19.55 19 20 18.55 20 18V9" />
    <path d="M4 11L14 11C15.1 11 16 10.1 16 9V5C16 3.9 15.1 3 14 3L11 3C9.9 3 9 3.9 9 5V11" />
    <path d="M4 11C4 9.34 5.34 8 7 8H9" />
    <path d="M20 9C20 6.79 18.21 5 16 5" />
    <path d="M11 19V21H13V19" />
    <path d="M4 15H9" />
  </svg>
)
import { searchMembers, getMemberDebt, processMemberPayment, getActiveEvents } from "@/app/actions/billing"
import { registerAttendee } from "@/app/actions/registraciones"
import Link from "next/link"

type Step = 'CATEGORY' | 'SEARCH_MEMBER' | 'DEBT_SELECTION' | 'PAYMENT' | 'EVENT_SELECTION' | 'EVENT_FORM' | 'SUCCESS'

export default function CobrarWizard() {
  const [step, setStep] = useState<Step>('CATEGORY')
  const [category, setCategory] = useState<'CUOTA' | 'EVENTO' | null>(null)
  
  // Member Flow
  const [memberQuery, setMemberQuery] = useState("")
  const [memberResults, setMemberResults] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [debts, setDebts] = useState<{months: any[], total: number}>({months: [], total: 0})
  const [selectedMonths, setSelectedMonths] = useState<any[]>([])
  
  // Event Flow
  const [activeEvents, setActiveEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [eventFormData, setEventFormData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    phone: "",
    registrationType: "MILONGA",
    amountPaid: 0,
    quantity: 1
  })

  // Final Step
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO")
  const [notes, setNotes] = useState("")
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [isEventMemberSearchOpen, setIsEventMemberSearchOpen] = useState(false)
  const [eventMemberQuery, setEventMemberQuery] = useState("")
  const [eventMemberResults, setEventMemberResults] = useState<any[]>([])

  // Search members logic for Event
  useEffect(() => {
    if (eventMemberQuery.length > 2) {
      const delay = setTimeout(async () => {
        const results = await searchMembers(eventMemberQuery)
        setEventMemberResults(results)
      }, 300)
      return () => clearTimeout(delay)
    } else {
      setEventMemberResults([])
    }
  }, [eventMemberQuery])

  const calculateEventPrice = (type: string, qty: number, member: any) => {
    if (!selectedEvent) return 0
    const isMember = !!member && member.status === 'ACTIVE'
    let unitPrice = 0
    
    if (type === 'MILONGA') {
      unitPrice = isMember ? (selectedEvent.priceSocioMilonga || selectedEvent.priceNonSocioMilonga || 0) : (selectedEvent.priceNonSocioMilonga || 0)
    } else if (type === 'WORKSHOP') {
      unitPrice = isMember ? (selectedEvent.priceSocioWorkshop || selectedEvent.priceNonSocioWorkshop || 0) : (selectedEvent.priceNonSocioWorkshop || 0)
    } else if (type === 'FULL') {
      unitPrice = isMember ? (selectedEvent.priceSocioFull || selectedEvent.priceNonSocioFull || 0) : (selectedEvent.priceNonSocioFull || 0)
    }
    
    return unitPrice * qty
  }

  // Effect to update amount when type, qty or member changes
  useEffect(() => {
    if (step === 'EVENT_FORM' && selectedEvent) {
      const newAmount = calculateEventPrice(eventFormData.registrationType, eventFormData.quantity, selectedMember)
      setEventFormData(prev => ({ ...prev, amountPaid: newAmount }))
    }
  }, [eventFormData.registrationType, eventFormData.quantity, selectedMember, step])

  // Search members logic
  useEffect(() => {
    if (memberQuery.length > 2) {
      const delay = setTimeout(async () => {
        const results = await searchMembers(memberQuery)
        setMemberResults(results)
      }, 300)
      return () => clearTimeout(delay)
    } else {
      setMemberResults([])
    }
  }, [memberQuery])

  // Select Member and Load Debt
  const handleSelectMember = async (member: any) => {
    setSelectedMember(member)
    const data = await getMemberDebt(member.id)
    setDebts(data)
    setSelectedMonths(data.months) // Select all by default
    setStep('DEBT_SELECTION')
  }

  // Load Active Events
  const handleSelectEventCategory = async () => {
    setCategory('EVENTO')
    const events = await getActiveEvents()
    setActiveEvents(events)
    setStep('EVENT_SELECTION')
  }

  const handleProcessPayment = async () => {
    setLoading(true)
    try {
      if (category === 'CUOTA') {
        const formData = new FormData()
        formData.append("payload", JSON.stringify({
          selectedMonths,
          paymentMethod,
          notes,
          amountPaid: selectedMonths.reduce((acc, curr) => acc + curr.amount, 0),
        }))
        if (paymentProof) formData.append("paymentProof", paymentProof)
        
        await processMemberPayment(selectedMember.id, formData)
      } else if (category === 'EVENTO') {
        const formData = new FormData()
        formData.append("eventId", selectedEvent.id)
        formData.append("memberId", selectedMember?.id || "")
        formData.append("firstName", eventFormData.firstName)
        formData.append("lastName", eventFormData.lastName)
        formData.append("dni", eventFormData.dni)
        formData.append("email", eventFormData.email)
        formData.append("phone", eventFormData.phone || "")
        formData.append("registrationType", eventFormData.registrationType)
        formData.append("amountPaid", eventFormData.amountPaid.toString())
        formData.append("paymentStatus", "PAID")
        formData.append("paymentMethod", paymentMethod)
        if (paymentProof) formData.append("paymentProof", paymentProof)
        
        await registerAttendee(formData)
      }
      setStep('SUCCESS')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Stepper Progress Indicator */}
      <div className="flex items-center justify-between mb-12 px-4">
         {[1, 2, 3, 4].map((num) => (
           <div key={num} className="flex items-center flex-1 last:flex-none">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2 ${
               (step === 'CATEGORY' && num === 1) || 
               ((step === 'SEARCH_MEMBER' || step === 'EVENT_SELECTION') && num === 2) ||
               ((step === 'DEBT_SELECTION' || step === 'EVENT_FORM') && num === 3) ||
               (step === 'PAYMENT' && num === 4) ||
               (step === 'SUCCESS' && num === 4)
                 ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-900/40" 
                 : (num < 4 && (
                    (step !== 'CATEGORY' && num === 1) ||
                    ((step === 'DEBT_SELECTION' || step === 'EVENT_FORM' || step === 'PAYMENT' || step === 'SUCCESS') && num === 2) ||
                    ((step === 'PAYMENT' || step === 'SUCCESS') && num === 3)
                 ))
                 ? "bg-amber-600/20 border-amber-600/50 text-amber-500" 
                 : "bg-zinc-900 border-white/5 text-zinc-600"
             }`}>
                {num === 4 && step === 'SUCCESS' ? <CheckCircle2 size={24} /> : num}
             </div>
             {num < 4 && <div className={`h-[2px] flex-1 mx-4 rounded-full ${
               (num === 1 && step !== 'CATEGORY') ||
               (num === 2 && (step === 'DEBT_SELECTION' || step === 'EVENT_FORM' || step === 'PAYMENT' || step === 'SUCCESS')) ||
               (num === 3 && (step === 'PAYMENT' || step === 'SUCCESS'))
               ? "bg-amber-600/50" : "bg-zinc-900"
             }`}></div>}
           </div>
         ))}
      </div>

      {/* Step 1: Category Selection */}
      {step === 'CATEGORY' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
           <h2 className="text-3xl font-bold mb-2">¿Qué desea cobrar?</h2>
           <p className="text-zinc-500 mb-10">Seleccione el servicio o evento para continuar con el registro de pago.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => {setCategory('CUOTA'); setStep('SEARCH_MEMBER')}}
                className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-amber-600/10 hover:border-amber-500/50 transition-all text-left relative overflow-hidden"
              >
                 <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform -mb-6 -mr-6 text-amber-500">
                    <Users size={180} />
                 </div>
                 <div className="w-16 h-16 bg-amber-600/20 text-amber-500 rounded-2xl flex items-center justify-center mb-6 border border-amber-600/20">
                    <Users size={32} />
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Cuota de Socio</h3>
                 <p className="text-zinc-400">Mensualidades, inscripciones, y saldos pendientes.</p>
                 <div className="mt-8 flex items-center gap-2 text-amber-500 font-bold text-sm uppercase tracking-widest">
                    Continuar <ArrowRight size={16} />
                 </div>
              </button>

              <button 
                 onClick={handleSelectEventCategory}
                 className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-red-600/10 hover:border-red-500/50 transition-all text-left relative overflow-hidden"
              >
                 <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform -mb-6 -mr-6 text-red-500">
                    <TangoShoe size={180} />
                 </div>
                 <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-600/20">
                    <TangoShoe size={32} />
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Eventos y Milongas</h3>
                 <p className="text-zinc-400">Entradas, talleres y actividades especiales.</p>
                 <div className="mt-8 flex items-center gap-2 text-red-500 font-bold text-sm uppercase tracking-widest">
                    Continuar <ArrowRight size={16} />
                 </div>
              </button>
           </div>
        </div>
      )}

      {/* Step 2A: Member Search */}
      {step === 'SEARCH_MEMBER' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
           <button onClick={() => setStep('CATEGORY')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 transition-colors">
              <ArrowLeft size={16} /> Volver
           </button>
           <h2 className="text-3xl font-bold mb-2">Buscar Socio</h2>
           <p className="text-zinc-500 mb-8">Ingrese el nombre, DNI o número de ficha para identificar al socio.</p>
           
           <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input 
                autoFocus
                type="text"
                placeholder="Nombre, Apellido o DNI..."
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xl focus:border-amber-500/50 outline-none transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && memberResults.length === 1) handleSelectMember(memberResults[0])
                }}
              />
           </div>

           <div className="space-y-3">
              {memberResults.map(member => (
                <button 
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        {member.firstName[0]}{member.lastName[0]}
                     </div>
                     <div>
                        <p className="font-bold text-lg">{member.lastName}, {member.firstName}</p>
                        <p className="text-zinc-500 text-sm italic">#{member.memberNumber} • DNI: {member.dni}</p>
                     </div>
                  </div>
                  <ChevronRight className="text-zinc-700 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
              {memberQuery.length > 2 && memberResults.length === 0 && (
                <div className="text-center py-10 text-zinc-600 italic">No se encontraron resultados para "{memberQuery}"</div>
              )}
           </div>
        </div>
      )}

      {/* Step 3A: Debt Selection */}
      {step === 'DEBT_SELECTION' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
           <button onClick={() => setStep('SEARCH_MEMBER')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 transition-colors">
              <ArrowLeft size={16} /> Volver
           </button>
           <h2 className="text-3xl font-bold mb-2">Estado de Deuda</h2>
           <p className="text-zinc-500 mb-8">Socio: <span className="text-white font-medium">{selectedMember.firstName} {selectedMember.lastName}</span></p>

           <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md mb-8">
              <div className="flex flex-col gap-4">
                 {debts.months.length === 0 ? (
                   <div className="text-center py-10">
                      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                         <CheckCircle2 size={32} />
                      </div>
                      <p className="font-bold text-xl text-emerald-400">¡Socio al día!</p>
                      <p className="text-zinc-500 text-sm">No registra cuotas pendientes para el período actual.</p>
                   </div>
                 ) : (
                   <>
                      <div className="space-y-3 pb-6 border-b border-white/5">
                        <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">Meses Pendientes</p>
                        {debts.months.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                             <div className="flex items-center gap-4">
                                <input 
                                  type="checkbox" 
                                  checked={selectedMonths.some(m => m.month === item.month && m.year === item.year)}
                                  onChange={(e) => {
                                     if (e.target.checked) setSelectedMonths([...selectedMonths, item])
                                     else setSelectedMonths(selectedMonths.filter(m => !(m.month === item.month && m.year === item.year)))
                                  }}
                                  className="w-5 h-5 accent-amber-500 bg-zinc-800 border-white/10 rounded"
                                />
                                <div>
                                   <p className="font-bold uppercase tracking-wider text-sm">{new Date(0, item.month - 1).toLocaleString('es', { month: 'long' })} {item.year}</p>
                                   <p className="text-zinc-500 text-xs">{item.existingRecord ? "PAGO PARCIAL" : "CUOTA MENSUAL"}</p>
                                </div>
                             </div>
                             <p className="font-mono text-lg text-white">${item.amount.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center py-2">
                         <p className="text-zinc-400 font-medium">Total Seleccionado ({selectedMonths.length} meses)</p>
                         <p className="text-3xl font-bold text-amber-500">${selectedMonths.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
                      </div>
                   </>
                 )}
              </div>
           </div>

           <div className="flex justify-end gap-4">
              <button 
                disabled={selectedMonths.length === 0}
                onClick={() => setStep('PAYMENT')}
                className="flex items-center gap-2 bg-gradient-to-tr from-amber-600 to-red-800 hover:from-amber-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:grayscale"
              >
                 Continuar al Pago <ArrowRight size={16} />
              </button>
           </div>
        </div>
      )}

      {/* Step 2B: Event Selection */}
      {step === 'EVENT_SELECTION' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
           <button onClick={() => setStep('CATEGORY')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 transition-colors">
              <ArrowLeft size={16} /> Volver
           </button>
           <h2 className="text-3xl font-bold mb-2">Seleccionar Evento</h2>
           <p className="text-zinc-500 mb-8">Seleccione la milonga o actividad que desea cobrar.</p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeEvents.map(event => (
                <button 
                  key={event.id}
                  onClick={() => {setSelectedEvent(event); setStep('EVENT_FORM')}}
                  className="flex flex-col p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-red-500/30 transition-all text-left group"
                >
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                         {event.type === 'WORKSHOP' ? <GraduationCap size={24} /> : <TangoShoe size={24} />}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-white/5 uppercase">
                         {new Date(event.startDate).toLocaleDateString()}
                      </span>
                   </div>
                   <h3 className="text-xl font-bold mb-1 group-hover:text-red-400 transition-colors uppercase tracking-tight">{event.title}</h3>
                   <p className="text-zinc-500 text-sm line-clamp-2">{event.description}</p>
                </button>
              ))}
              {activeEvents.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white/5 border border-white/10 border-dashed rounded-3xl">
                   <Music size={48} className="mx-auto text-zinc-700 opacity-20 mb-4" />
                   <p className="text-zinc-500 font-medium">No hay eventos activos.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Step 3B: Event Form */}
      {step === 'EVENT_FORM' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
           <button onClick={() => setStep('EVENT_SELECTION')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 transition-colors">
              <ArrowLeft size={16} /> Volver
           </button>
            <h2 className="text-3xl font-bold mb-2 text-red-500 uppercase italic tracking-tighter">Cobro de Actividad</h2>
            <p className="text-zinc-500 mb-8 border-l-2 border-red-500 pl-4">Evento: <span className="text-white font-black uppercase tracking-tight">{selectedEvent.title}</span></p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                 <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <div className="flex justify-between items-center mb-4">
                       <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Datos de la Persona</p>
                       {!selectedMember ? (
                         <button 
                           onClick={() => setIsEventMemberSearchOpen(!isEventMemberSearchOpen)}
                           className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20"
                         >
                           <Search size={14} /> {isEventMemberSearchOpen ? "Cerrar X" : "Vincular Socio"}
                         </button>
                       ) : (
                         <button 
                           onClick={() => {
                             setSelectedMember(null);
                             setEventFormData({...eventFormData, firstName: "", lastName: "", dni: "", email: ""})
                           }}
                           className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20"
                         >
                           Desvincular
                         </button>
                       )}
                    </div>

                    {isEventMemberSearchOpen && !selectedMember && (
                      <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                          <input 
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            value={eventMemberQuery}
                            onChange={(e) => setEventMemberQuery(e.target.value)}
                            className="w-full bg-black/60 border border-amber-500/30 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                           {eventMemberResults.map(m => (
                             <div 
                                key={m.id}
                                onClick={() => {
                                  setSelectedMember(m);
                                  setEventFormData({
                                    ...eventFormData,
                                    firstName: m.firstName || "",
                                    lastName: m.lastName || "",
                                    dni: m.dni || "",
                                    email: m.email || ""
                                  });
                                  setIsEventMemberSearchOpen(false);
                                  setEventMemberQuery("");
                                }}
                                className="w-full text-left p-2 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 flex justify-between items-center cursor-pointer transition-colors"
                             >
                                <span className="text-xs font-bold">{m.lastName}, {m.firstName}</span>
                                <span className="text-[10px] text-zinc-500">#{m.memberNumber}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                       {selectedMember && (
                         <div className="p-3 bg-amber-600/10 border border-amber-600/30 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-amber-600/20">S</div>
                            <div>
                               <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter leading-none mb-1">Socio Identificado</p>
                               <p className="text-xs text-zinc-300 font-bold uppercase">{selectedMember.firstName} {selectedMember.lastName} (#{selectedMember.memberNumber})</p>
                            </div>
                         </div>
                       )}
                       <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="text" 
                            placeholder="Nombre(s)"
                            value={eventFormData.firstName}
                            readOnly={!!selectedMember}
                            onChange={(e) => setEventFormData({...eventFormData, firstName: e.target.value})}
                            className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500/50 ${selectedMember ? 'opacity-50 cursor-not-allowed text-zinc-400' : ''}`}
                          />
                          <input 
                            type="text" 
                            placeholder="Apellido(s)"
                            value={eventFormData.lastName}
                            readOnly={!!selectedMember}
                            onChange={(e) => setEventFormData({...eventFormData, lastName: e.target.value})}
                            className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500/50 ${selectedMember ? 'opacity-50 cursor-not-allowed text-zinc-400' : ''}`}
                          />
                       </div>
                       <input 
                         type="text" 
                         placeholder="DNI (opcional)"
                         value={eventFormData.dni}
                         readOnly={!!selectedMember}
                         onChange={(e) => setEventFormData({...eventFormData, dni: e.target.value})}
                         className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500/50 ${selectedMember ? 'opacity-50 cursor-not-allowed text-zinc-400' : ''}`}
                       />
                       <input 
                         type="email" 
                         placeholder="Email para comprobante"
                         value={eventFormData.email}
                         onChange={(e) => setEventFormData({...eventFormData, email: e.target.value})}
                         className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500/50"
                       />
                       <input 
                         type="tel" 
                         placeholder="Teléfono de contacto"
                         value={eventFormData.phone}
                         onChange={(e) => setEventFormData({...eventFormData, phone: e.target.value})}
                         className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-red-500/50"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-3xl h-full flex flex-col">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Opciones de Cobro</p>
                    <div className="space-y-4 flex-1">
                       <div className="space-y-2">
                          <label className="text-xs font-medium text-zinc-500 uppercase ml-1">Tipo de Entrada</label>
                          <select 
                            value={eventFormData.registrationType}
                            onChange={(e) => setEventFormData({...eventFormData, registrationType: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer focus:border-red-500/50"
                          >
                             <option value="MILONGA">Entrada Milonga</option>
                             {selectedEvent.type !== 'MILONGA' && <option value="WORKSHOP">Taller / Clase</option>}
                             {selectedEvent.type === 'BOTH' && <option value="FULL">Combo Completo</option>}
                          </select>
                       </div>

                       <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
                          <div className="space-y-1">
                             <p className="text-xs font-medium text-zinc-400 uppercase">Cantidad</p>
                             <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => setEventFormData({...eventFormData, quantity: Math.max(1, eventFormData.quantity - 1)})}
                                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold"
                                >-</button>
                                <span className="w-8 text-center font-bold text-lg">{eventFormData.quantity}</span>
                                <button 
                                  onClick={() => setEventFormData({...eventFormData, quantity: eventFormData.quantity + 1})}
                                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold"
                                >+</button>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Tarifa Aplicada</p>
                             <p className="text-sm font-bold text-white italic">{selectedMember ? "Socio (Descuento)" : "No Socio"}</p>
                          </div>
                       </div>

                       <div className="pt-6 mt-6 border-t border-white/5">
                          <div className="flex justify-between items-end mb-2 px-1">
                             <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Monto Final</label>
                             <span className="text-[10px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded italic">Confirmar o ajustar</span>
                          </div>
                          <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-red-500/40">$</div>
                             <input 
                                type="number" 
                                value={eventFormData.amountPaid}
                                onChange={(e) => setEventFormData({...eventFormData, amountPaid: parseFloat(e.target.value)})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-5 text-4xl font-black text-red-500 outline-none focus:border-red-500/50 shadow-inner"
                             />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex justify-end gap-4">
              <button 
                disabled={!eventFormData.firstName || !eventFormData.lastName || eventFormData.amountPaid <= 0}
                onClick={() => setStep('PAYMENT')}
                className="flex items-center gap-3 bg-gradient-to-tr from-red-600 to-amber-700 hover:from-red-500 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-tighter transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 group"
              >
                 Continuar <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
           </div>
        </div>
      )}

      {/* Step 4: Final Payment Confirmation */}
      {step === 'PAYMENT' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
           <button onClick={() => category === 'CUOTA' ? setStep('DEBT_SELECTION') : setStep('EVENT_FORM')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 transition-colors">
              <ArrowLeft size={16} /> Volver
           </button>
           <h2 className="text-3xl font-bold mb-2">Finalizar Pago</h2>
           <p className="text-zinc-500 mb-8">Seleccione el medio de pago para cerrar el registro.</p>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2 space-y-6">
                 <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md space-y-8">
                    <div className="space-y-4">
                       <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block ml-1">Medio de Pago</label>
                       <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                          {['EFECTIVO', 'MERCADO PAGO', 'TRANSFERENCIA'].map(method => (
                            <button
                              key={method}
                              onClick={() => setPaymentMethod(method)}
                              className={`p-4 rounded-2xl border-2 transition-all font-bold text-xs tracking-widest ${
                                paymentMethod === method 
                                ? "bg-amber-600/10 border-amber-600 text-amber-500 shadow-lg shadow-amber-600/5" 
                                : "bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5"
                              }`}
                            >
                               {method}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                       <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block ml-1">Observaciones / Notas</label>
                       <textarea 
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Indique cualquier detalle relevante del pago..."
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-amber-500/50 transition-colors text-zinc-300"
                       />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block ml-1">Comprobante / Archivo adjunto</label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20"
                        />
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 h-full flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-6 pb-2 border-b border-white/5 relative">Resumen del Cobro</h3>
                    
                    <div className="space-y-5 flex-1 relative">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 uppercase">Concepto</span>
                          <span className="font-bold uppercase text-zinc-300">{category === 'CUOTA' ? "CUOTAS" : "EVENTO"}</span>
                       </div>
                       <div className="flex flex-col gap-1.5 p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-zinc-500 text-[10px] font-bold uppercase">Detalle</span>
                          <span className="font-black text-sm uppercase text-white truncate">
                             {category === 'CUOTA' ? `${selectedMonths.length} meses` : `${eventFormData.registrationType} (x${eventFormData.quantity})`}
                          </span>
                       </div>
                       {selectedMember && (
                         <div className="flex flex-col gap-1.5 p-3 bg-amber-600/5 rounded-xl border border-amber-600/10">
                            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-tighter">Socio Registrado</span>
                            <span className="font-bold text-xs uppercase text-zinc-300 truncate">{selectedMember.lastName}, {selectedMember.firstName}</span>
                         </div>
                       )}
                       <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                          <span className="text-zinc-500 text-[10px] font-bold uppercase">Pago vía</span>
                          <span className="font-black text-xs uppercase text-amber-500">{paymentMethod}</span>
                       </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-white/5 relative">
                       <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Total a Recibir</p>
                       <p className="text-5xl font-black text-white px-1 tracking-tighter">
                          <span className="text-amber-500 text-2xl mr-1 font-black">$</span>
                          {category === 'CUOTA' 
                            ? selectedMonths.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()
                            : eventFormData.amountPaid.toLocaleString()}
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex justify-end gap-4 mt-12">
              <button 
                disabled={loading}
                onClick={handleProcessPayment}
                className="w-full flex items-center justify-center gap-4 bg-gradient-to-tr from-amber-600 to-red-800 hover:from-amber-500 text-white px-8 py-6 rounded-3xl font-black text-xl uppercase tracking-tighter transition-all shadow-2xl shadow-red-900/40 group relative overflow-hidden"
              >
                 {loading ? (
                   <span className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Procesando...
                   </span>
                 ) : (
                   <>
                      <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                      Registrar Cobro
                   </>
                 )}
              </button>
           </div>
        </div>
      )}

      {/* Step FIN: Success Animation & Links */}
      {step === 'SUCCESS' && (
        <div className="animate-in zoom-in-95 fade-in duration-500 text-center py-20 px-8">
            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
               <CheckCircle2 size={48} className="animate-in zoom-in-50 duration-700" />
            </div>
            <h2 className="text-4xl font-bold mb-4">¡Cobro Realizado!</h2>
            <p className="text-zinc-500 text-xl max-w-md mx-auto mb-12">
               La transacción ha sido registrada exitosamente. El comprobante y la notificación por email se enviarán en breve.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
               <button 
                  onClick={() => {
                    setStep('CATEGORY');
                    setSelectedMember(null);
                    setSelectedEvent(null);
                    setMemberQuery("");
                    setSelectedMonths([]);
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
               >
                  Realizar otro Cobro
               </button>
               <Link 
                  href="/admin/cuotas"
                  className="bg-zinc-100 hover:bg-white text-zinc-950 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
               >
                  Ir al Listado <ArrowRight size={20} />
               </Link>
            </div>
        </div>
      )}
    </div>
  )
}
