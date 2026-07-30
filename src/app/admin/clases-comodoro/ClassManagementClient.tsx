"use client"

import { useState, useRef } from "react"
import { 
  BookOpen, 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Instagram, 
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Building,
  Tag,
  CheckCircle2,
  FileText
} from "lucide-react"
import { toast } from "sonner"
import { 
  createTangoClass, 
  updateTangoClass, 
  deleteTangoClass, 
  toggleTangoClassVisibility,
  createTangoTeacher,
  updateTangoTeacher,
  deleteTangoTeacher
} from "@/app/actions/clases-actions"

interface LocalClass {
  id: string
  teacherName: string
  group: string | null
  teacherId: string | null
  city: string
  neighborhood: string | null
  locationName: string
  address: string
  schedule: string
  contactInfo: string | null
  priceType: string
  priceDetails: string | null
  registrationUrl: string | null
  notes: string | null
  isPublished: boolean
  order: number
  teacher?: any
}

interface LocalTeacher {
  id: string
  fullName: string
  photoUrl: string | null
  bio: string | null
  phone: string | null
  email: string | null
  instagram: string | null
  city: string
  isActive: boolean
  classes?: any[]
}

export function ClassManagementClient({
  initialClasses,
  initialTeachers
}: {
  initialClasses: LocalClass[]
  initialTeachers: LocalTeacher[]
}) {
  const [activeTab, setActiveTab] = useState<"CLASSES" | "TEACHERS">("CLASSES")
  const [classes, setClasses] = useState<LocalClass[]>(initialClasses)
  const [teachers, setTeachers] = useState<LocalTeacher[]>(initialTeachers)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [cityFilter, setCityFilter] = useState("TODAS")
  const [priceFilter, setPriceFilter] = useState("TODOS")

  // Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<LocalClass | null>(null)
  const [classForm, setClassForm] = useState({
    teacherName: "",
    group: "",
    teacherId: "",
    city: "Comodoro Rivadavia",
    neighborhood: "",
    locationName: "",
    address: "",
    schedule: "",
    contactInfo: "",
    priceType: "ARANCELADO",
    priceDetails: "",
    registrationUrl: "",
    notes: "",
    isPublished: true
  })

  // Teacher Modal State
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<LocalTeacher | null>(null)
  const [teacherForm, setTeacherForm] = useState({
    fullName: "",
    photoUrl: "",
    bio: "",
    phone: "",
    email: "",
    instagram: "",
    city: "Comodoro Rivadavia"
  })

  const teacherFileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  // Handlers for Class Modal
  const openNewClassModal = () => {
    setEditingClass(null)
    setClassForm({
      teacherName: "",
      group: "",
      teacherId: "",
      city: "Comodoro Rivadavia",
      neighborhood: "",
      locationName: "",
      address: "",
      schedule: "",
      contactInfo: "",
      priceType: "ARANCELADO",
      priceDetails: "",
      registrationUrl: "",
      notes: "",
      isPublished: true
    })
    setIsClassModalOpen(true)
  }

  const openEditClassModal = (cls: LocalClass) => {
    setEditingClass(cls)
    setClassForm({
      teacherName: cls.teacherName,
      group: cls.group || "",
      teacherId: cls.teacherId || "",
      city: cls.city,
      neighborhood: cls.neighborhood || "",
      locationName: cls.locationName,
      address: cls.address,
      schedule: cls.schedule,
      contactInfo: cls.contactInfo || "",
      priceType: cls.priceType,
      priceDetails: cls.priceDetails || "",
      registrationUrl: cls.registrationUrl || "",
      notes: cls.notes || "",
      isPublished: cls.isPublished
    })
    setIsClassModalOpen(true)
  }

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classForm.teacherName || !classForm.locationName || !classForm.schedule) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    try {
      if (editingClass) {
        const res = await updateTangoClass(editingClass.id, {
          ...classForm,
          teacherId: classForm.teacherId || null
        })
        if (res.success && res.data) {
          setClasses(prev => prev.map(c => c.id === editingClass.id ? (res.data as LocalClass) : c))
          toast.success("Clase actualizada correctamente")
          setIsClassModalOpen(false)
        } else {
          toast.error(res.error || "Error al actualizar la clase")
        }
      } else {
        const res = await createTangoClass({
          ...classForm,
          teacherId: classForm.teacherId || null
        })
        if (res.success && res.data) {
          setClasses(prev => [res.data as LocalClass, ...prev])
          toast.success("Clase creada correctamente")
          setIsClassModalOpen(false)
        } else {
          toast.error(res.error || "Error al crear la clase")
        }
      }
    } catch (err: any) {
      toast.error("Ocurrió un error al guardar")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (cls: LocalClass) => {
    const newStatus = !cls.isPublished
    const res = await toggleTangoClassVisibility(cls.id, newStatus)
    if (res.success) {
      setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, isPublished: newStatus } : c))
      toast.success(newStatus ? "Clase publicada en la web" : "Clase ocultada de la web")
    } else {
      toast.error(res.error)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta clase?")) return

    const res = await deleteTangoClass(id)
    if (res.success) {
      setClasses(prev => prev.filter(c => c.id !== id))
      toast.success("Clase eliminada correctamente")
    } else {
      toast.error(res.error)
    }
  }

  // Handlers for Teacher Modal
  const openNewTeacherModal = () => {
    setEditingTeacher(null)
    setTeacherForm({
      fullName: "",
      photoUrl: "",
      bio: "",
      phone: "",
      email: "",
      instagram: "",
      city: "Comodoro Rivadavia"
    })
    setIsTeacherModalOpen(true)
  }

  const openEditTeacherModal = (teacher: LocalTeacher) => {
    setEditingTeacher(teacher)
    setTeacherForm({
      fullName: teacher.fullName,
      photoUrl: teacher.photoUrl || "",
      bio: teacher.bio || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      instagram: teacher.instagram || "",
      city: teacher.city
    })
    setIsTeacherModalOpen(true)
  }

  // Direct Photo File Upload Handler
  const handleTeacherPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 3 * 1024 * 1024) {
      toast.error("La foto es demasiado pesada. Máximo 3MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setTeacherForm(prev => ({ ...prev, photoUrl: reader.result as string }))
      toast.success("Foto cargada con éxito")
    }
    reader.readAsDataURL(file)
  }

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherForm.fullName) {
      toast.error("Ingresa el nombre del profesor")
      return
    }

    setLoading(true)
    try {
      if (editingTeacher) {
        const res = await updateTangoTeacher(editingTeacher.id, teacherForm)
        if (res.success && res.data) {
          setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? (res.data as LocalTeacher) : t))
          toast.success("Profesor/a actualizado/a")
          setIsTeacherModalOpen(false)
        } else {
          toast.error(res.error)
        }
      } else {
        const res = await createTangoTeacher(teacherForm)
        if (res.success && res.data) {
          setTeachers(prev => [...prev, res.data as LocalTeacher])
          toast.success("Profesor/a registrado/a")
          setIsTeacherModalOpen(false)
        } else {
          toast.error(res.error)
        }
      }
    } catch (err) {
      toast.error("Error al guardar profesor")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("¿Eliminar profesor del catálogo? Sus clases no se borrarán pero se desvincularán del perfil.")) return

    const res = await deleteTangoTeacher(id)
    if (res.success) {
      setTeachers(prev => prev.filter(t => t.id !== id))
      toast.success("Profesor eliminado")
    } else {
      toast.error(res.error)
    }
  }

  // Filtered classes logic
  const filteredClasses = classes.filter(c => {
    const matchesSearch = searchQuery === "" || 
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.group && c.group.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.neighborhood && c.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCity = cityFilter === "TODAS" || c.city === cityFilter
    const matchesPrice = priceFilter === "TODOS" || c.priceType === priceFilter

    return matchesSearch && matchesCity && matchesPrice
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/60 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen size={16} /> Guía de Clases Comodoro y Rada Tilly (Marzo 2026)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Publicación de Clases de Tango</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Administrá los horarios, sedes, fotos y docentes de las clases públicas de Comodoro Rivadavia y Rada Tilly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/clases-comodoro"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold border border-white/10 flex items-center gap-2 transition-all"
          >
            <ExternalLink size={14} /> Ver Vista Web
          </a>

          {activeTab === "CLASSES" ? (
            <button
              onClick={openNewClassModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-zinc-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Nueva Clase
            </button>
          ) : (
            <button
              onClick={openNewTeacherModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-zinc-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Nuevo Profesor
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("CLASSES")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === "CLASSES" 
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5" 
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BookOpen size={16} /> Clases Registradas ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab("TEACHERS")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === "TEACHERS" 
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5" 
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users size={16} /> Directorio de Profesores & Fotos ({teachers.length})
        </button>
      </div>

      {/* TAB 1: CLASSES */}
      {activeTab === "CLASSES" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Buscar por profesor, grupo, barrio o sede..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="TODAS">Todas las Ciudades</option>
              <option value="Comodoro Rivadavia">Comodoro Rivadavia</option>
              <option value="Rada Tilly">Rada Tilly</option>
            </select>

            <select
              value={priceFilter}
              onChange={e => setPriceFilter(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="TODOS">Todos los Valores</option>
              <option value="GRATIS">Gratis ($0)</option>
              <option value="ARANCELADO">Arancelado</option>
            </select>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClasses.map(cls => (
              <div 
                key={cls.id}
                className={`bg-zinc-900/70 border ${cls.isPublished ? 'border-white/10' : 'border-red-500/20 opacity-60'} p-5 rounded-3xl space-y-4 hover:border-amber-500/30 transition-all flex flex-col justify-between group`}
              >
                <div className="space-y-3">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-amber-400">
                        📍 {cls.city}
                      </span>
                      {cls.neighborhood && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/5 text-zinc-400">
                          {cls.neighborhood}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cls.priceType === "GRATIS" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      }`}>
                        {cls.priceType}
                      </span>

                      <button
                        onClick={() => handleToggleVisibility(cls)}
                        title={cls.isPublished ? "Visible en la web (hacé clic para ocultar)" : "Oculto en la web (hacé clic para publicar)"}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          cls.isPublished 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {cls.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Teacher & Venue */}
                  <div>
                    {cls.group && (
                      <span className="text-[10px] font-bold text-amber-500/90 uppercase tracking-widest block mb-0.5">
                        {cls.group}
                      </span>
                    )}
                    <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">
                      {cls.teacherName}
                    </h3>
                    <p className="text-xs font-semibold text-zinc-300 mt-0.5 flex items-center gap-1.5">
                      <MapPin size={12} className="text-amber-500 shrink-0" /> {cls.locationName}
                    </p>
                    <p className="text-[11px] text-zinc-500 pl-4">{cls.address}</p>
                  </div>

                  {/* Schedule */}
                  <div className="bg-black/30 p-3 rounded-2xl border border-white/5 space-y-1">
                    <div className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={12} /> Horario
                    </div>
                    <p className="text-xs text-zinc-200 font-medium">{cls.schedule}</p>
                  </div>

                  {/* Notes */}
                  {cls.notes && (
                    <div className="text-[11px] text-amber-300/90 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10 font-light flex items-start gap-1.5">
                      <FileText size={12} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>{cls.notes}</span>
                    </div>
                  )}

                  {/* Contact */}
                  {cls.contactInfo && (
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Phone size={12} className="text-zinc-500" /> {cls.contactInfo}
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">
                    {cls.isPublished ? "🟢 Publicado online" : "🔴 Oculto"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditClassModal(cls)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 transition-colors border border-white/5"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors border border-white/5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TEACHERS */}
      {activeTab === "TEACHERS" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
            <p className="text-xs text-zinc-400">
              Cargá o cambiá las **fotos de perfil** de los profesores. Se mostrarán inmediatamente en la web pública.
            </p>
            <button
              onClick={openNewTeacherModal}
              className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold flex items-center gap-2"
            >
              <Plus size={14} /> Agregar Profesor
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teachers.map(teacher => (
              <div 
                key={teacher.id}
                className="bg-zinc-900/60 border border-white/10 p-5 rounded-3xl text-center space-y-4 hover:border-amber-500/30 transition-all group flex flex-col justify-between relative"
              >
                <div className="space-y-3">
                  {/* Photo with quick edit overlay */}
                  <div className="relative w-24 h-24 rounded-full mx-auto overflow-hidden bg-zinc-800 border-2 border-amber-500/30 shadow-lg shadow-black group-hover:border-amber-400 transition-all">
                    {teacher.photoUrl ? (
                      <img src={teacher.photoUrl} alt={teacher.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={40} className="text-zinc-600 mx-auto my-auto mt-4" />
                    )}
                    
                    <button
                      onClick={() => openEditTeacherModal(teacher)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                    >
                      <ImageIcon size={18} />
                      <span>Subir Foto</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-white text-base group-hover:text-amber-400 transition-colors">
                      {teacher.fullName}
                    </h3>
                    <p className="text-[11px] text-amber-500 font-semibold uppercase tracking-wider">{teacher.city}</p>
                  </div>

                  {teacher.bio && (
                    <p className="text-xs text-zinc-400 line-clamp-2 font-light italic">"{teacher.bio}"</p>
                  )}

                  <div className="space-y-1 text-xs text-zinc-400 text-left pt-2 border-t border-white/5">
                    {teacher.phone && <p className="flex items-center gap-2"><Phone size={12} className="text-amber-500 shrink-0" /> {teacher.phone}</p>}
                    {teacher.email && <p className="flex items-center gap-2 truncate"><Mail size={12} className="text-amber-500 shrink-0" /> {teacher.email}</p>}
                    {teacher.instagram && <p className="flex items-center gap-2"><Instagram size={12} className="text-pink-500 shrink-0" /> {teacher.instagram}</p>}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => openEditTeacherModal(teacher)}
                    className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <Upload size={12} /> Cargar Foto
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditTeacherModal(teacher)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 transition-colors border border-white/5"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors border border-white/5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLASS MODAL */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-3xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingClass ? "Editar Clase de Tango" : "Nueva Clase de Tango"}
              </h2>
              <button 
                onClick={() => setIsClassModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Profesor / Docente *</label>
                  <input
                    type="text"
                    placeholder="Ej: Leandro y Camila"
                    value={classForm.teacherName}
                    onChange={e => setClassForm({ ...classForm, teacherName: e.target.value })}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Grupo / Escuela (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Comodoro Tango, Garufa"
                    value={classForm.group}
                    onChange={e => setClassForm({ ...classForm, group: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Ciudad *</label>
                  <select
                    value={classForm.city}
                    onChange={e => setClassForm({ ...classForm, city: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Comodoro Rivadavia">Comodoro Rivadavia</option>
                    <option value="Rada Tilly">Rada Tilly</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Barrio (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Centro, Roca, KM5"
                    value={classForm.neighborhood}
                    onChange={e => setClassForm({ ...classForm, neighborhood: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Valor / Modalidad *</label>
                  <select
                    value={classForm.priceType}
                    onChange={e => setClassForm({ ...classForm, priceType: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="GRATIS">Gratis ($0)</option>
                    <option value="ARANCELADO">Arancelado</option>
                    <option value="CONSULTAR">Consultar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Lugar / Sede *</label>
                <input
                  type="text"
                  placeholder="Ej: Swing Estudio, Centro Cultural Comodoro, CIP"
                  value={classForm.locationName}
                  onChange={e => setClassForm({ ...classForm, locationName: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Dirección</label>
                <input
                  type="text"
                  placeholder="Ej: Maipu 1369, Hipólito Yrigoyen 99"
                  value={classForm.address}
                  onChange={e => setClassForm({ ...classForm, address: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Horario de Clases *</label>
                <input
                  type="text"
                  placeholder="Ej: Viernes 20 a 21.30 hs / Martes 21 hs"
                  value={classForm.schedule}
                  onChange={e => setClassForm({ ...classForm, schedule: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Contacto / Teléfono / Email</label>
                <input
                  type="text"
                  placeholder="Ej: 2974 31-5848 / leandrojvelasques@gmail.com"
                  value={classForm.contactInfo}
                  onChange={e => setClassForm({ ...classForm, contactInfo: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Observaciones / Comentarios</label>
                <input
                  type="text"
                  placeholder="Ej: Inicia Viernes 6 de Marzo para nivel principiantes"
                  value={classForm.notes}
                  onChange={e => setClassForm({ ...classForm, notes: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={classForm.isPublished}
                  onChange={e => setClassForm({ ...classForm, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded bg-black border-white/20 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="isPublished" className="text-xs font-medium text-zinc-300 cursor-pointer">
                  Publicar inmediatamente en el sitio web online
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold hover:from-amber-400 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar Clase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER MODAL WITH DIRECT FILE UPLOAD */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingTeacher ? "Editar Profesor/a y Foto" : "Nuevo Profesor/a"}
              </h2>
              <button 
                onClick={() => setIsTeacherModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-5">
              
              {/* Photo Upload Component */}
              <div className="space-y-2 text-center">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Foto de Perfil del Profesor/a
                </label>
                
                <div className="relative group w-28 h-28 mx-auto">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-500/50 bg-zinc-800 flex items-center justify-center shadow-xl relative">
                    {teacherForm.photoUrl ? (
                      <img src={teacherForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="text-zinc-600" size={40} />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => teacherFileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1 cursor-pointer"
                  >
                    <Upload size={20} />
                    <span>Subir Foto</span>
                  </button>

                  {teacherForm.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setTeacherForm({ ...teacherForm, photoUrl: "" })}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      title="Quitar foto"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Hidden input for file selection */}
                <input
                  type="file"
                  ref={teacherFileInputRef}
                  onChange={handleTeacherPhotoFile}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => teacherFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/20 transition-all"
                  >
                    <Upload size={14} /> Subir Imagen desde mi Equipo
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Nombre y Apellido *</label>
                <input
                  type="text"
                  placeholder="Ej: Leandro y Camila"
                  value={teacherForm.fullName}
                  onChange={e => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Biografía / Reseña corta</label>
                <textarea
                  placeholder="Breve reseña o trayectoria..."
                  rows={2}
                  value={teacherForm.bio}
                  onChange={e => setTeacherForm({ ...teacherForm, bio: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="2974 31-5848"
                    value={teacherForm.phone}
                    onChange={e => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Email</label>
                  <input
                    type="email"
                    placeholder="contacto@ejemplo.com"
                    value={teacherForm.email}
                    onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold hover:from-amber-400 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar Profesor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
