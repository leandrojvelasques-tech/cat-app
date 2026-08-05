import { getEffectiveEventPrices } from "@/lib/event-utils"

type EventClassOption = {
  id: string
  title: string
}

type SelectableEvent = {
  hasClasses: boolean
  hasMilonga: boolean
  isFree: boolean
  comboTitle: string | null
  classes: EventClassOption[]
  [key: string]: unknown
}

export type EventRegistrationSelection = {
  includeCombo: boolean
  includeMilonga: boolean
  selectedClassIds: string[]
}

export function parseSelectedClassIds(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || value.trim() === "") return []

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== "string")) return []
    return [...new Set(parsed)]
  } catch {
    return []
  }
}

export function resolveEventRegistrationSelection(
  event: SelectableEvent,
  selection: EventRegistrationSelection,
  isSocio: boolean
) {
  const selectedClassIds = [...new Set(selection.selectedClassIds)]
  const availableClasses = new Map(event.classes.map((eventClass) => [eventClass.id, eventClass]))

  if (selection.includeCombo && selectedClassIds.length > 0) {
    throw new Error("Elegí el combo completo o clases sueltas, pero no ambas opciones.")
  }

  if (selection.includeCombo && !event.hasClasses) {
    throw new Error("Este evento no ofrece un combo de clases.")
  }

  if (selection.includeMilonga && !event.hasMilonga) {
    throw new Error("Este evento no incluye milonga.")
  }

  const selectedClasses = selectedClassIds.map((id) => availableClasses.get(id))
  if (selectedClasses.some((eventClass) => !eventClass)) {
    throw new Error("Una de las clases seleccionadas no pertenece a este evento.")
  }

  if (selectedClassIds.length > 0 && !event.hasClasses) {
    throw new Error("Este evento no ofrece clases para seleccionar.")
  }

  if (!event.isFree && !selection.includeCombo && !selection.includeMilonga && selectedClassIds.length === 0) {
    throw new Error("Seleccioná al menos una opción para inscribirte.")
  }

  const prices = getEffectiveEventPrices(event)
  const looseClassPrice = isSocio ? prices.classLooseSocio : prices.classLooseNonSocio
  const comboPrice = isSocio ? prices.comboSocio : prices.comboNonSocio
  const milongaPrice = isSocio ? prices.milongaSocio : prices.milongaNonSocio

  const amountPaid = event.isFree
    ? 0
    : (selection.includeCombo ? comboPrice : selectedClassIds.length * looseClassPrice)
      + (selection.includeMilonga ? milongaPrice : 0)

  const registrationParts: string[] = []
  if (selection.includeCombo) registrationParts.push(event.comboTitle || "COMBO_CLASES")
  if (selectedClasses.length > 0) {
    registrationParts.push(`CLASES_SUELTAS: ${selectedClasses.map((eventClass) => eventClass!.title).join(", ")}`)
  }
  if (selection.includeMilonga) registrationParts.push("MILONGA")

  return {
    amountPaid,
    registrationType: registrationParts.join(" + ") || "ENTRADA_GENERAL",
    selectedClassIds,
  }
}
