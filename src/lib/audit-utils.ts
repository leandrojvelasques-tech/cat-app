import { db } from "@/lib/db"

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  details?: string
  timestamp: string
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const setting = await db.setting.findUnique({
      where: { key: "historial_auditoria" }
    })
    if (!setting || !setting.value) {
      return []
    }
    const parsed = JSON.parse(setting.value) as AuditLogEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Error leyendo historial_auditoria:", error)
    return []
  }
}

export async function recordAuditLog(
  user: { id?: string; name?: string | null; email?: string | null; role?: string },
  action: string,
  details?: string
) {
  try {
    const currentLogs = await getAuditLogs()
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      userId: user.id || "system",
      userName: user.name || user.email || "Usuario",
      userRole: user.role || "BOARD",
      action,
      details: details || "",
      timestamp: new Date().toISOString()
    }

    // Keep last 50 audit entries
    const updatedLogs = [newEntry, ...currentLogs].slice(0, 50)

    await db.setting.upsert({
      where: { key: "historial_auditoria" },
      update: { value: JSON.stringify(updatedLogs) },
      create: { key: "historial_auditoria", value: JSON.stringify(updatedLogs) }
    })
  } catch (error) {
    console.error("Error grabando log de auditoria:", error)
  }
}
