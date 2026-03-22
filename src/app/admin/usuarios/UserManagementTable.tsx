"use client"

import { useState } from "react"
import { Key, Mail, Trash2, Edit, Check, X, Shield, Users as UsersIcon } from "lucide-react"
import { updateUserPassword, updateUserEmail, deleteUser } from "@/app/actions/users"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  member?: {
    id: string
    firstName: string
    lastName: string
    memberNumber: string
  }
}

export function UserManagementTable({ users }: { users: User[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editType, setEditType] = useState<'PASSWORD' | 'EMAIL' | null>(null)
  const [newValue, setNewValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async (id: string) => {
    if (!newValue) return
    setIsLoading(true)
    try {
      if (editType === 'PASSWORD') {
        await updateUserPassword(id, newValue)
        alert("Contraseña actualizada")
      } else {
        await updateUserEmail(id, newValue)
        alert("Email actualizado")
      }
      setEditingId(null)
      setEditType(null)
      setNewValue("")
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (confirm(`¿Estás seguro que deseas eliminar el usuario ${email}? (Esto dejará al socio sin acceso portal)`)) {
      try {
        await deleteUser(id)
        alert("Usuario eliminado")
      } catch (e: any) {
        alert("Error: " + e.message)
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5">
            <th className="py-6 px-4 text-[10px] uppercase font-black tracking-widest text-zinc-600">Nombre / Socio</th>
            <th className="py-6 px-4 text-[10px] uppercase font-black tracking-widest text-zinc-600">Email (Usuario)</th>
            <th className="py-6 px-4 text-[10px] uppercase font-black tracking-widest text-zinc-600">Rol</th>
            <th className="py-6 px-4 text-[10px] uppercase font-black tracking-widest text-zinc-600 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((user) => (
            <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
              <td className="py-6 px-4">
                <div className="flex flex-col">
                  <span className="text-white font-bold tracking-tight">{user.name || "Sin nombre"}</span>
                  {user.member && (
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-500/70 italic">Socio #{user.member.memberNumber}</span>
                  )}
                </div>
              </td>
              <td className="py-6 px-4">
                {editingId === user.id && editType === 'EMAIL' ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="email" 
                      value={newValue} 
                      onChange={(e) => setNewValue(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-amber-500/50 outline-none w-64"
                    />
                    <button onClick={() => handleUpdate(user.id)} disabled={isLoading} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><Check size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-white/5 text-zinc-500 rounded-lg hover:bg-white/10"><X size={14}/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm">{user.email}</span>
                    <button 
                      onClick={() => { setEditingId(user.id); setEditType('EMAIL'); setNewValue(user.email); }}
                      className="p-1 text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                )}
              </td>
              <td className="py-6 px-4">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                    {user.role === 'ADMIN' ? <Shield size={12} /> : <UsersIcon size={12} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{user.role}</span>
                </div>
              </td>
              <td className="py-6 px-4 text-right">
                <div className="flex justify-end gap-2">
                  {editingId === user.id && editType === 'PASSWORD' ? (
                    <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                       <input 
                        type="text" 
                        placeholder="Nueva clave..."
                        value={newValue} 
                        onChange={(e) => setNewValue(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                      />
                      <button onClick={() => handleUpdate(user.id)} disabled={isLoading} className="px-3 py-1.5 bg-amber-500 text-zinc-950 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] transition-all">CAMBIAR</button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 bg-white/5 text-zinc-500 rounded-lg hover:bg-white/10"><X size={14}/></button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => { setEditingId(user.id); setEditType('PASSWORD'); setNewValue(""); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
                      >
                         <Key size={14} className="text-zinc-600" /> Clave
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.email)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
                      >
                         <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
