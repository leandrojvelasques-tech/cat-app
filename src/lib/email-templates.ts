export const DEFAULT_FEE_REMINDER_TEMPLATE = `Hola {nombre},

Te recordamos que el día {dia_vencimiento} vence la cuota social correspondiente a {mes}.

El valor vigente de la cuota es de {monto_cuota}.

Tu aporte mensual permite sostener las actividades, clases, encuentros y propuestas del Centro Amigos del Tango.

Si ya realizaste el pago, podés desestimar este recordatorio. Si todavía no lo hiciste, te agradecemos que puedas regularizarlo antes de la fecha de vencimiento.

{detalle_deuda}

BENEFICIOS ACTUALES COMO SOCIO

{beneficios}

EVENTOS Y ACTIVIDADES DE {mes}

{eventos_mes}

Algunos beneficios requieren tener la cuota al día.

Muchas gracias por seguir acompañando al Centro Amigos del Tango.

Un abrazo,

Tesorería
Centro Amigos del Tango`

export type BatchEmailTemplate = {
  key: "custom" | "msg_recordatorio" | "msg_vencida" | "msg_mora"
  label: string
  subject: string
  body: string
  variables: readonly string[]
}

export const BATCH_EMAIL_TEMPLATE_DEFINITIONS = [
  {
    key: "custom" as const,
    label: "Mensaje personalizado",
    subject: "",
    settingKey: null,
    variables: ["{nombre}", "{nro_socio}", "{estado}", "{deuda}", "{deuda_texto}"],
  },
  {
    key: "msg_recordatorio" as const,
    label: "Recordatorio de vencimiento",
    subject: "Cuota social de {mes}: vence el día {dia_vencimiento}",
    settingKey: "msg_recordatorio",
    variables: ["{nombre}", "{mes}", "{dia_vencimiento}", "{monto_cuota}", "{detalle_deuda}", "{beneficios}", "{eventos_mes}"],
  },
  {
    key: "msg_vencida" as const,
    label: "Cuota vencida",
    subject: "Recordatorio de cuota pendiente — Centro Amigos del Tango",
    settingKey: "msg_vencida",
    variables: ["{nombre}", "{estado}", "{deuda}", "{deuda_texto}"],
  },
  {
    key: "msg_mora" as const,
    label: "Notificación de morosidad",
    subject: "Suspensión temporal de beneficios por mora — CAT",
    settingKey: "msg_mora",
    variables: ["{nombre}", "{estado}", "{deuda}", "{deuda_texto}"],
  },
] as const
