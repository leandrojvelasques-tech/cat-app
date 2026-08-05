"use client"

import { useState, useRef } from "react"
import { MonthlyTeacher, updateEscuelitaDocentesStructured, uploadEscuelitaDocentePhoto } from "@/app/actions/escuelita"
import { Users, Plus, Upload, Trash2, Edit, X, UserCheck, Sparkles } from "lucide-react"
import { toast } from "sonner"

export function MonthlyTeachersManager({
  initialTeachers,
  initialDocentesText
}: {
  initialTeachers: MonthlyTeacher[]
  initialDocentesText: string
}) {
  const [teachers, setTeachers] = useState<MonthlyTeacher[]>(initialTeachers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<MonthlyTeacher | null>(null)
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    photoUrl: "",
    role: "Docente del Mes"
  })

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openNewModal = () => {
    setEditingTeacher(null)
    setForm({
      firstName: "",
      lastName: "",
      photoUrl: "",
      role: "Docente del Mes"
    })
    setIsModalOpen(true)
  }

  const openEditModal = (t: MonthlyTeacher) => {
    setEditingTeacher(t)
    setForm({
      firstName: t.firstName,
      lastName: t.lastName,
      photoUrl: t.photoUrl || "",
      role: t.role || "Docente del Mes"
    })
    setIsModalOpen(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La foto debe pesar menos de 5MB")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await uploadEscuelitaDocentePhoto(formData)
      if (res.success && res.url) {
        setForm(prev => ({ ...prev, photoUrl: res.url }))
        toast.success("Foto subida correctamente")
      } else {
        toast.error(res.error || "Error al subir la foto")
      }
    } catch (err: any) {
      toast.error("Error al procesar la imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Ingresá nombre y apellido del profesor/a")
      return
    }

    let updatedList: MonthlyTeacher[] = []
    if (editingTeacher) {
      updatedList = teachers.map(t => t.id === editingTeacher.id ? {
        ...t,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        photoUrl: form.photoUrl,
        role: form.role
      } : t)
    } else {
      const newTeacher: MonthlyTeacher = {
        id: `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        photoUrl: form.photoUrl,
        role: form.role
      }
      updatedList = [...teachers, newTeacher]
    }

    setSaving(true)
    const res = await updateEscuelitaDocentesStructured(updatedList)
    setSaving(false)

    if (res.success) {
      setTeachers(updatedList)
      toast.success(editingTeacher ? "Profesor/a actualizado/a" : "Profesor/a agregado/a")
      setIsModalOpen(false)
    } else {
      toast.error(res.error || "Error al guardar")
    }
  }

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("¿Eliminar este profesor de la lista del mes?")) return

    const updatedList = teachers.filter(t => t.id !== id)
    setSaving(true)
    const res = await updateEscuelitaDocentesStructured(updatedList)
    setSaving(false)

    if (res.success) {
      setTeachers(updatedList)
      toast.success("Profesor/a eliminado/a")
    } else {
      toast.error(res.error || "Error al eliminar")
    }
  }

  return (
    <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="text-blue-500" size={20} />
            <span>Profesores del Mes</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Cargá los profes asignados este mes para la **Escuela del CAT**. Se renovará automáticamente en la web.
          </p>
        </div>
        
        <button
          onClick={openNewModal}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-blue-900/30 cursor-pointer"
        >
          <Plus size={14} /> Cargar Profe del Mes
        </button>
      </div>

      {/* Teachers List */}
      <div className="space-y-3">
        {teachers.length === 0 ? (
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center space-y-2">
            <Users className="mx-auto text-zinc-600" size={32} />
            <p className="text-xs text-zinc-400">No se agregaron profes individuales con foto aún.</p>
            <p className="text-[11px] text-blue-400 font-medium italic">Actualmente mostrándose como: "{initialDocentesText}"</p>
          </div>
        ) : (
          teachers.map(t => (
            <div 
              key={t.id}
              className="flex items-center justify-between p-3.5 bg-black/40 border border-white/10 rounded-2xl group hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-blue-500/30 shrink-0 flex items-center justify-center">
                  {t.photoUrl ? (
                    <img src={t.photoUrl} alt={`${t.firstName} ${t.lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={20} className="text-zinc-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {t.firstName} {t.lastName}
                  </h4>
                  <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    {t.role || "Docente del Mes"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/20 text-zinc-400 hover:text-blue-300 transition-colors"
                  title="Editar"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDeleteTeacher(t.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" />
                {editingTeacher ? "Editar Profesor/a del Mes" : "Agregar Profesor/a del Mes"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4">
              {/* Photo selector */}
              <div className="text-center space-y-2">
                <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-blue-500/40 bg-zinc-800 flex items-center justify-center shadow-lg">
                  {form.photoUrl ? (
                    <img src={form.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Users size={32} className="text-zinc-600" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-white font-bold">
                      Subiendo...
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-blue-500/20 transition-all cursor-pointer"
                >
                  <Upload size={12} /> {form.photoUrl ? "Cambiar Foto" : "Subir Foto"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Apellido *</label>
                  <input
                    type="text"
                    placeholder="Ej: Pérez"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Rol / Nota</label>
                <input
                  type="text"
                  placeholder="Ej: Docente del Mes / Profesor Socio CAT"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Guardando..." : "Guardar Profesor/a"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
