import { db } from "@/lib/db"

interface SendEmailParams {
  to: string
  subject: string
  html: string
  memberId?: string
  type: string
  from?: string
}

/**
 * Función principal para enviar correos usando la API de Resend.
 * Si no está configurada la API KEY, escribe en consola y crea un registro de Communication "FAILED".
 */
export async function sendEmail({ to, subject, html, memberId, type, from }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  let status = "SENT"
  
  const fromEmail = from || process.env.EMAIL_FROM || "CAT WEB <no-reply@centroamigosdeltango.com>"

  console.log(`[EMAIL SENDING] Enviando correo de tipo "${type}" a "${to}" con asunto "${subject}" desde "${fromEmail}"...`)

  if (!apiKey) {
    console.warn(`[EMAIL WARNING] RESEND_API_KEY no configurada. El correo no se envió a producción, pero queda registrado en la base de datos local.`)
    status = "FAILED"
  } else {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: html,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        console.error("[EMAIL ERROR] Error de la API de Resend:", errData)
        status = "FAILED"
      } else {
        console.log(`[EMAIL SUCCESS] Correo enviado exitosamente a "${to}" via Resend.`)
      }
    } catch (e) {
      console.error("[EMAIL ERROR] Excepción al enviar correo:", e)
      status = "FAILED"
    }
  }

  // Si tenemos un memberId, registramos la comunicación en el historial del socio
  if (memberId) {
    try {
      await db.communication.create({
        data: {
          memberId,
          type,
          subject,
          content: html, // Guardamos el HTML enviado
          sentBy: "SYSTEM",
          status,
          channel: "EMAIL",
        },
      })
    } catch (dbErr) {
      console.error("[EMAIL DB ERROR] No se pudo guardar la comunicación en la base de datos:", dbErr)
    }
  }

  return status === "SENT"
}

export function getBaseUrl(): string {
  const envUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/+$/, "")
  }
  return "https://www.centroamigosdeltango.com"
}

// Helper para convertir texto plano de plantillas en un correo HTML institucional elegante
function buildEmailLayout(contentHtml: string) {
  const baseUrl = getBaseUrl()
  return `
    <div style="background-color: #f4f4f5; padding: 30px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; bg-color: #ffffff; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e4e4e7;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1b2621 0%, #131313 100%); padding: 24px 32px; text-align: center; border-bottom: 3px solid #A6702E;">
          <h1 style="color: #F2A81D; margin: 0; font-size: 22px; font-weight: 800; tracking-wide: 1px; font-family: Georgia, serif;">
            Centro Amigos del Tango
          </h1>
          <p style="color: #a1a1aa; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">Comodoro Rivadavia · Asociación Civil</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px; color: #27272a; font-size: 15px; line-height: 1.6;">
          ${contentHtml}
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #71717a;">
          <p style="margin: 0 0 4px 0;"><strong>Centro Amigos del Tango</strong> — Fomentando la pasión y la cultura del 2x4.</p>
          <p style="margin: 0; font-size: 11px; color: #a1a1aa;">Comodoro Rivadavia, Chubut, Argentina.</p>
        </div>
      </div>
    </div>
  `
}

function processTemplateText(text: string, variables: Record<string, string>): string {
  let result = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  for (const [key, val] of Object.entries(variables)) {
    const reg = new RegExp(`\\{${key}\\}`, "g")
    result = result.replace(reg, val)
  }

  // Si ya es HTML estructural completo
  if (result.includes("<div") || result.includes("<p")) {
    return result
  }

  // Si es texto plano con saltos de línea, convertir a párrafos HTML
  const paragraphs = result
    .split(/\n\s*\n/)
    .map(p => `<p style="margin-bottom: 16px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("")

  return paragraphs
}

// 1. Solicitud de Inscripción Recibida (Agradecimiento al solicitante)
export async function sendEnrollmentSubmittedEmail(request: { firstName: string; lastName: string; email: string }) {
  const subject = "Recibimos tu solicitud de inscripción — Centro Amigos del Tango"
  
  const setting = await db.setting.findUnique({ where: { key: "msg_solicitud_inscripcion" } })
  const rawTemplate = setting?.value || `¡Hola {nombre}!\n\nAgradecemos tu interés en formar parte del Centro Amigos del Tango.\n\nQueremos confirmarte que hemos recibido tu solicitud de inscripción y el comprobante de pago de tu primera cuota social.\n\nNuestra área de Tesorería verificará la información a la brevedad. Una vez aprobada tu alta, recibirás un nuevo correo electrónico con tu número de socio asignado y tus datos de acceso al Portal de Socios.\n\n¡Esperamos vernos pronto en la pista!`

  const formattedContent = processTemplateText(rawTemplate, {
    nombre: `${request.firstName} ${request.lastName}`
  })

  const html = buildEmailLayout(formattedContent)

  return sendEmail({
    to: request.email,
    subject,
    html,
    type: "WELCOME",
  })
}

// 2. Notificación al Tesorero de nueva solicitud recibida
export async function sendNewEnrollmentAlertToBoard(request: { firstName: string; lastName: string; DNI: string }) {
  const adminEmailSetting = await db.setting.findUnique({ where: { key: "email_admin" } })
  const to = adminEmailSetting?.value || "info@centroamigosdeltango.com"
  
  const subject = "Nueva solicitud de inscripción recibida — CAT"
  const content = `
    <h2 style="color: #A6702E; margin-top: 0;">Nueva Solicitud de Socio</h2>
    <p>Se ha registrado una nueva solicitud de inscripción en el sitio web:</p>
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #e4e4e7;">
      <p style="margin: 4px 0;"><strong>Nombre:</strong> ${request.firstName} ${request.lastName}</p>
      <p style="margin: 4px 0;"><strong>DNI:</strong> ${request.DNI}</p>
    </div>
    <p>Por favor, ingresá al Panel de Administración para validar el comprobante de pago y autorizar el alta del socio.</p>
    <div style="margin-top: 24px; text-align: center;">
      <a href="${getBaseUrl()}/admin/solicitudes" style="background-color: #A6702E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Ver Solicitudes Pendientes</a>
    </div>
  `

  return sendEmail({
    to,
    subject,
    html: buildEmailLayout(content),
    type: "GENERAL",
  })
}

// 2b. Notificación a la Comisión Directiva y Mails Adicionales por Inscripción a Evento / Comprobante de Pago
export async function sendEventRegistrationAlertToBoard(
  event: { id: string; title: string; notificationEmails?: string | null },
  registration: { 
    firstName: string
    lastName: string
    dni?: string | null
    email?: string | null
    phone?: string | null
    registrationType: string
    amountPaid: number
    paymentMethod?: string | null
    paymentProof?: string | null
  }
) {
  const adminEmailSetting = await db.setting.findUnique({ where: { key: "email_admin" } })
  const defaultAdminEmail = adminEmailSetting?.value || "info@centroamigosdeltango.com"

  // Recopilar correos adicionales del evento
  const additionalEmailsRaw = event.notificationEmails || ""
  const additionalEmails = additionalEmailsRaw
    .split(/[,;\n]/)
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0 && e.includes("@"))

  // Combinar y eliminar duplicados
  const recipients = Array.from(new Set([defaultAdminEmail.toLowerCase(), ...additionalEmails]))

  const hasProof = !!registration.paymentProof
  const subject = hasProof
    ? `Nuevo comprobante enviado para evento: "${event.title}" — CAT`
    : `Nueva inscripción a evento: "${event.title}" — CAT`

  const baseUrl = getBaseUrl()
  const adminEventUrl = `${baseUrl}/admin/eventos/${event.id}`

  const content = `
    <h2 style="color: #A6702E; margin-top: 0;">${hasProof ? "Comprobante de Pago de Evento Recibido" : "Nueva Inscripción a Evento"}</h2>
    <p>Se ha registrado una nueva ${hasProof ? "entrega de comprobante" : "reserva/inscripción"} para el evento <strong>${event.title}</strong>:</p>
    
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #e4e4e7;">
      <p style="margin: 4px 0;"><strong>Asistente:</strong> ${registration.firstName} ${registration.lastName}</p>
      ${registration.dni ? `<p style="margin: 4px 0;"><strong>DNI:</strong> ${registration.dni}</p>` : ""}
      ${registration.email ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${registration.email}</p>` : ""}
      ${registration.phone ? `<p style="margin: 4px 0;"><strong>Teléfono:</strong> ${registration.phone}</p>` : ""}
      <p style="margin: 4px 0;"><strong>Opción:</strong> ${registration.registrationType}</p>
      <p style="margin: 4px 0;"><strong>Monto:</strong> $${registration.amountPaid.toLocaleString("es-AR")}</p>
      <p style="margin: 4px 0;"><strong>Modalidad Pago:</strong> ${registration.paymentMethod || "Efectivo"}</p>
      <p style="margin: 4px 0;"><strong>Estado:</strong> ${hasProof ? "<span style='color: #d97706; font-weight: bold;'>⚠️ Se requiere aprobación (Comprobante adjunto)</span>" : "Registrado"}</p>
    </div>

    <p>Por favor, ingresá al Panel de Administración de este evento para validar la reserva o aprobar el comprobante.</p>
    <div style="margin-top: 24px; text-align: center;">
      <a href="${adminEventUrl}" style="background-color: #A6702E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Ver Detalle del Evento en Admin</a>
    </div>
  `

  console.log(`[EVENT ALERTS] Enviando notificación de evento "${event.title}" a ${recipients.length} destinatario(s): ${recipients.join(", ")}`)

  // Enviar correo a cada destinatario
  for (const toEmail of recipients) {
    await sendEmail({
      to: toEmail,
      subject,
      html: buildEmailLayout(content),
      type: "EVENT_INFO",
    }).catch(err => console.error(`Error enviando notificación de evento a ${toEmail}:`, err))
  }

  return true
}

// 3. Confirmación de Alta de Socio (Bienvenida + credenciales)
export async function sendEnrollmentApprovedEmail(
  member: { id: string; firstName: string; lastName: string; email: string | null; memberNumber: string },
  user: { email: string },
  tempPassword: string
) {
  if (!member.email) return false
  
  const subject = "¡Bienvenido/a al Centro Amigos del Tango!"
  const authUrl = getBaseUrl()
  
  // Buscar plantilla de bienvenida en DB o usar default
  const setting = await db.setting.findUnique({ where: { key: "msg_bienvenida" } })
  const rawTemplate = setting?.value || `¡Bienvenido/a {nombre} al Centro Amigos del Tango! 💃\n\n📌 Tu número de socio es: #{socio}\n\nUsuario de acceso: {username}\nClave temporal: {password}\n\n¡Nos vemos pronto en la pista!`

  const formattedContent = processTemplateText(rawTemplate, {
    nombre: `${member.firstName} ${member.lastName}`,
    socio: member.memberNumber,
    username: user.email,
    password: tempPassword,
    auth_url: authUrl
  })

  // Agregar bloque visual destacado de credenciales y botón de acceso
  const credentialsBox = `
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-left: 4px solid #F2A81D; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #A6702E;">Datos de Acceso al Portal de Socios</p>
      <p style="margin: 4px 0;"><strong>Número de Socio:</strong> <span style="color: #A6702E; font-weight: 800;">#${member.memberNumber}</span></p>
      <p style="margin: 4px 0;"><strong>Usuario:</strong> ${user.email}</p>
      <p style="margin: 4px 0;"><strong>Contraseña Temporal:</strong> <code style="background: #e4e4e7; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
    </div>
    <div style="margin: 24px 0; text-align: center;">
      <a href="${authUrl}/login" style="background-color: #A6702E; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">Ingresar al Portal de Socios</a>
    </div>
  `

  const finalHtml = buildEmailLayout(`${formattedContent}${credentialsBox}`)

  return sendEmail({
    to: member.email,
    subject,
    html: finalHtml,
    memberId: member.id,
    type: "WELCOME",
  })
}

// 4. Recordatorio Vencimiento de Cuota (Día 1 de cada mes)
export async function sendFeeReminderEmail(
  member: { id: string; firstName: string; lastName: string; email: string | null },
  unpaidMonths: string[],
  amount: number
) {
  if (!member.email) return false
  
  const subject = "Recordatorio de Pago de Cuota Social — Centro Amigos del Tango"
  const setting = await db.setting.findUnique({ where: { key: "msg_recordatorio" } })
  
  let body = setting?.value || `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2>Hola {nombre},</h2>
      <p>Te recordamos de manera amable que ya está disponible para abonar la cuota social del mes en curso.</p>
      <p>El valor de la cuota mensual actual es de <strong>${amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong>, pagadero entre los días 1 y 5 del mes.</p>
      {detalle_deuda}
      <p>En caso de que ya hayas realizado el pago, por favor responde a este correo adjuntando el comprobante para que podamos realizar el ajuste en el sistema.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888;">Centro Amigos del Tango</p>
    </div>
  `

  let debtDetailsHtml = ""
  if (unpaidMonths.length > 0) {
    debtDetailsHtml = `
      <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Registramos los siguientes períodos pendientes de pago:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          ${unpaidMonths.map(m => `<li>${m}</li>`).join("")}
        </ul>
      </div>
    `
  }

  body = body
    .replace(/{nombre}/g, `${member.firstName} ${member.lastName}`)
    .replace(/{detalle_deuda}/g, debtDetailsHtml)

  return sendEmail({
    to: member.email,
    subject,
    html: body,
    memberId: member.id,
    type: "DEBT_REMINDER",
  })
}

// 5. Notificación de Mora (Al acumular 3 meses impagos)
export async function sendSocioEnMoraEmail(
  member: { id: string; firstName: string; lastName: string; email: string | null },
  unpaidMonths: string[]
) {
  if (!member.email) return false
  
  const subject = "Suspensión temporal de beneficios por mora — CAT"
  const setting = await db.setting.findUnique({ where: { key: "msg_mora" } })
  
  let body = setting?.value || `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #c21a1a;">Estimado/a {nombre},</h2>
      <p>Lamentamos informarle que hemos detectado una acumulación de cuotas sociales impagas en su cuenta.</p>
      <p>A la fecha registra una deuda de 3 o más períodos impagos:</p>
      <ul style="color: #c21a1a; font-weight: bold;">
        ${unpaidMonths.map(m => `<li>${m}</li>`).join("")}
      </ul>
      <p>Debido a esto, <strong>sus beneficios como socio activo del Centro Amigos del Tango han quedado temporalmente suspendidos</strong> hasta que pueda regularizar su situación de cuenta.</p>
      <p>Le solicitamos que, si ya ha realizado las transferencias correspondientes, nos responda este correo con los comprobantes correspondientes para reactivar su ficha y beneficios en el sistema.</p>
      <p>Quedamos a su entera disposición.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888;">Tesorería · Centro Amigos del Tango</p>
    </div>
  `

  body = body.replace(/{nombre}/g, `${member.firstName} ${member.lastName}`)

  return sendEmail({
    to: member.email,
    subject,
    html: body,
    memberId: member.id,
    type: "DEBT_REMINDER",
  })
}

// 6. Confirmación de Pago de Cuota Validado
export async function sendPaymentValidatedEmail(
  member: { id: string; firstName: string; lastName: string; email: string | null },
  periods: { month: number; year: number; amount: number }[]
) {
  if (!member.email) return false
  
  const subject = "Recibo Digital de Pago de Cuotas — CAT"
  const setting = await db.setting.findUnique({ where: { key: "msg_pago_confirmado_cuota" } })
  
  let body = setting?.value || `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #A6702E;">¡Gracias por tu pago, {nombre}!</h2>
      <p>Te confirmamos que hemos validado y acreditado el pago de tus cuotas en el sistema.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #ddd; text-align: left;">
            <th style="padding: 10px;">Período</th>
            <th style="padding: 10px; text-align: right;">Monto Acreditado</th>
          </tr>
        </thead>
        <tbody>
          {detalle_pagos}
        </tbody>
      </table>

      <p>Tu estado de cuenta ha sido actualizado en el Portal de Socios.</p>
      <p>Agradecemos tu constante apoyo para sostener las actividades del Centro Amigos del Tango.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888;">Tesorería · Centro Amigos del Tango</p>
    </div>
  `

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const detailsHtml = periods.map(p => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px;">${monthNames[p.month - 1]} ${p.year}</td>
      <td style="padding: 10px; text-align: right; font-weight: bold;">${p.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
    </tr>
  `).join("")

  body = body
    .replace(/{nombre}/g, `${member.firstName} ${member.lastName}`)
    .replace(/{detalle_pagos}/g, detailsHtml)

  return sendEmail({
    to: member.email,
    subject,
    html: body,
    memberId: member.id,
    type: "GENERAL",
  })
}

// 7. Notificación de Baja de Socio
export async function sendDeactivationEmail(member: { id: string; firstName: string; lastName: string; email: string | null; memberNumber: string }) {
  if (!member.email) return false
  
  const subject = "Notificación de baja oficial del padrón — CAT"
  const setting = await db.setting.findUnique({ where: { key: "msg_baja" } })
  
  let body = setting?.value || `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2>Estimado/a {nombre},</h2>
      <p>Por la presente se le notifica que con fecha <strong>{fecha}</strong>, la Comisión Directiva del Centro Amigos del Tango ha procedido a darlo de baja como socio de la institución (Socio N° {socio}).</p>
      <p>Queda usted debidamente notificado/a.</p>
      <p>Saluda atentamente,</p>
      <p><strong>Comisión Directiva</strong><br/>Centro Amigos del Tango</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888;">Asociación Civil Centro Amigos del Tango. Comodoro Rivadavia.</p>
    </div>
  `

  body = body
    .replace(/{nombre}/g, `${member.firstName} ${member.lastName}`)
    .replace(/{socio}/g, member.memberNumber)
    .replace(/{fecha}/g, new Date().toLocaleDateString("es-AR"))

  return sendEmail({
    to: member.email,
    subject,
    html: body,
    memberId: member.id,
    type: "GENERAL",
  })
}

// 8. Notificación de Evento (enviado a socios activos)
export async function sendEventNotificationEmail(
  member: { id: string; firstName: string; lastName: string; email: string | null },
  event: { title: string; description: string | null; startDate: Date; location: string | null; eventBanner: string | null }
) {
  if (!member.email) return false

  const subject = `Nuevo Evento: ${event.title} — Centro Amigos del Tango`
  const dateStr = new Date(event.startDate).toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" })

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #A6702E; font-family: serif;">¡Hola ${member.firstName}!</h2>
      <p>Queremos invitarte a participar de un nuevo evento organizado por la asociación:</p>
      
      <div style="border: 1px solid #ddd; border-radius: 12px; overflow: hidden; margin: 20px 0; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        ${event.eventBanner ? `<img src="${event.eventBanner}" style="width: 100%; height: auto; max-height: 250px; object-cover: cover;" />` : ""}
        <div style="padding: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #1B2621; font-size: 20px;">${event.title}</h3>
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;"><strong>Fecha:</strong> ${dateStr}</p>
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;"><strong>Ubicación:</strong> ${event.location || "Sede Central CAT"}</p>
          <p style="margin: 0; line-height: 1.5; color: #444;">${event.description || ""}</p>
        </div>
      </div>
      
      <p>Podés ver más detalles y registrarte desde tu Portal de Socios.</p>
      <p>¡Esperamos contar con tu presencia!</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888;">© Centro Amigos del Tango. Comodoro Rivadavia, Chubut.</p>
    </div>
  `

  return sendEmail({
    to: member.email,
    subject,
    html,
    memberId: member.id,
    type: "EVENT_INFO",
  })
}

// 9. Restablecimiento de Contraseña
export async function sendPasswordResetEmail(
  user: { id: string; email: string; name: string | null },
  resetLink: string,
  memberId?: string
) {
  const subject = "Restablecer contraseña — Centro Amigos del Tango"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
      <h2 style="color: #F2A81D; font-family: serif; border-bottom: 2px solid #1B2621; padding-bottom: 10px; margin-bottom: 20px;">Restablecimiento de Contraseña</h2>
      <p>Hola <strong>${user.name || "Socio"}</strong>,</p>
      <p>Recibimos una solicitud para restablecer la contraseña de acceso a tu portal del Centro Amigos del Tango.</p>
      <p>Para ingresar tu nueva contraseña, por favor haz clic en el siguiente botón:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #F2A81D; color: #1B2621; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          Restablecer Contraseña
        </a>
      </div>
      
      <p style="font-size: 12px; color: #666; background-color: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #F2A81D;">
        <strong>Importante:</strong> Este enlace de recuperación expirará en 1 hora por razones de seguridad. Si no solicitaste este cambio, puedes ignorar este correo sin problemas.
      </p>
      
      <p style="margin-top: 30px; font-size: 14px;">Si el botón no funciona, puedes copiar y pegar la siguiente dirección en tu navegador:</p>
      <p style="font-size: 13px; color: #555; word-break: break-all; background-color: #eee; padding: 10px; border-radius: 4px;">
        ${resetLink}
      </p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 11px; color: #888; text-align: center;">© Centro Amigos del Tango. Comodoro Rivadavia, Chubut.</p>
    </div>
  `

  return sendEmail({
    to: user.email,
    subject,
    html,
    memberId,
    type: "PASSWORD_RESET",
  })
}

// 10. Acuse de recibo de comprobante/inscripción enviada al cliente (Pendiente de Verificación por Tesorería)
export async function sendAttendeePendingProofEmail(registration: {
  firstName: string
  email: string
  eventTitle: string
  registrationType: string
  amountPaid: number
}) {
  const subject = `Recibimos tu solicitud de inscripción — ${registration.eventTitle}`
  const contentHtml = `
    <h2 style="color: #A6702E; margin-top: 0;">¡Hola ${registration.firstName}!</h2>
    <p>Confirmamos que hemos recibido tu solicitud de inscripción y el comprobante de pago para el evento <strong>${registration.eventTitle}</strong>.</p>
    
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-left: 4px solid #F2A81D; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Evento:</strong> ${registration.eventTitle}</p>
      <p style="margin: 4px 0;"><strong>Opción:</strong> ${registration.registrationType}</p>
      <p style="margin: 4px 0;"><strong>Monto Registrado:</strong> $${registration.amountPaid.toLocaleString("es-AR")}</p>
      <p style="margin: 4px 0; color: #d97706; font-weight: bold;"><strong>Estado:</strong> En proceso de verificación por Tesorería</p>
    </div>

    <p>Nuestra área de Tesorería verificará la información a la brevedad. Una vez aprobada tu transferencia, recibirás un nuevo correo electrónico con la confirmación definitiva de tu lugar.</p>
    <p>¡Gracias por acompañarnos!</p>
  `

  return sendEmail({
    to: registration.email,
    subject,
    html: buildEmailLayout(contentHtml),
    type: "EVENT_INFO",
  })
}

// 11. Confirmación de Inscripción Aprobada (Enviado al cliente cuando la directiva aprueba el pago en el admin)
export async function sendAttendeeRegistrationApprovedEmail(registration: {
  firstName: string
  email: string
  eventTitle: string
  registrationType: string
  amountPaid: number
  eventDate?: Date | string | null
  location?: string | null
}) {
  const subject = `¡Inscripción Confirmada! — ${registration.eventTitle}`
  const dateStr = registration.eventDate ? new Date(registration.eventDate).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : ""

  const contentHtml = `
    <h2 style="color: #10b981; margin-top: 0;">¡Tu pago ha sido verificado! 🎉</h2>
    <p>Estimado/a <strong>${registration.firstName}</strong>,</p>
    <p>Nos alegra informarte que hemos acreditado tu pago y tu inscripción para el evento <strong>${registration.eventTitle}</strong> ha sido <strong>APROBADA EXITOSAMENTE</strong>.</p>
    
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Evento:</strong> ${registration.eventTitle}</p>
      ${dateStr ? `<p style="margin: 4px 0;"><strong>Fecha:</strong> ${dateStr}</p>` : ""}
      ${registration.location ? `<p style="margin: 4px 0;"><strong>Lugar:</strong> ${registration.location}</p>` : ""}
      <p style="margin: 4px 0;"><strong>Entrada/Opción:</strong> ${registration.registrationType}</p>
      <p style="margin: 4px 0;"><strong>Monto Acreditado:</strong> $${registration.amountPaid.toLocaleString("es-AR")}</p>
      <p style="margin: 4px 0; color: #047857; font-weight: bold;"><strong>Estado:</strong> COMPROBANTE APROBADO ✓</p>
    </div>

    <p>Te esperamos en la pista para disfrutar de este gran evento. Guardá este correo como comprobante de tu entrada.</p>
  `

  return sendEmail({
    to: registration.email,
    subject,
    html: buildEmailLayout(contentHtml),
    type: "EVENT_INFO",
  })
}

// 12. Confirmación de Inscripción a Evento Gratuito ($0)
export async function sendAttendeeFreeEventConfirmationEmail(registration: {
  firstName: string
  email: string
  eventTitle: string
  registrationType: string
  eventDate?: Date | string | null
  location?: string | null
}) {
  const subject = `Inscripción Confirmada al Evento Gratuito — ${registration.eventTitle}`
  const dateStr = registration.eventDate ? new Date(registration.eventDate).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : ""

  const contentHtml = `
    <h2 style="color: #A6702E; margin-top: 0;">¡Tu lugar está reservado! 💃</h2>
    <p>Hola <strong>${registration.firstName}</strong>,</p>
    <p>Confirmamos tu inscripción al evento gratuito <strong>${registration.eventTitle}</strong> del Centro Amigos del Tango.</p>
    
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-left: 4px solid #F2A81D; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
      <p style="margin: 4px 0;"><strong>Evento:</strong> ${registration.eventTitle}</p>
      ${dateStr ? `<p style="margin: 4px 0;"><strong>Fecha:</strong> ${dateStr}</p>` : ""}
      ${registration.location ? `<p style="margin: 4px 0;"><strong>Lugar:</strong> ${registration.location}</p>` : ""}
      <p style="margin: 4px 0;"><strong>Opción:</strong> ${registration.registrationType}</p>
      <p style="margin: 4px 0; color: #047857; font-weight: bold;"><strong>Costo:</strong> Gratuito ($0)</p>
    </div>

    <p>Tu inscripción ya ha sido registrada en nuestro sistema y podés presentarte directamente en el evento.</p>
    <p>¡Te esperamos!</p>
  `

  return sendEmail({
    to: registration.email,
    subject,
    html: buildEmailLayout(contentHtml),
    type: "EVENT_INFO",
  })
}
