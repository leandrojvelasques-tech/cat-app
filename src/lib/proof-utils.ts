/**
 * Extrae la URL o Data URI del comprobante de pago desde cualquier objeto de cuota o registración,
 * contemplando múltiples formatos de notas y propiedades de la base de datos.
 */
export function extractPaymentProofUrl(item: any): string | null {
  if (!item) return null

  // 1. Chequear propiedad directa paymentProof
  if (typeof item.paymentProof === "string" && item.paymentProof.trim()) {
    return item.paymentProof.trim()
  }
  if (item.fullData && typeof item.fullData.paymentProof === "string" && item.fullData.paymentProof.trim()) {
    return item.fullData.paymentProof.trim()
  }

  // 2. Extraer de proofUrl si fue pre-calculado
  if (typeof item.proofUrl === "string" && item.proofUrl.trim()) {
    return item.proofUrl.trim()
  }

  // 3. Inspeccionar el campo notes
  const notes: string = item.notes || item.fullData?.notes || ""
  if (typeof notes === "string" && notes.trim()) {
    // a. Patrón [COMPROBANTE SOCIO VERIFICACIÓN: ...]
    const matchSocio = notes.match(/\[COMPROBANTE SOCIO VERIFICACIÓN:\s*(.*?)\]/i)
    if (matchSocio && matchSocio[1]) return matchSocio[1].trim()

    // b. Patrón [COMPROBANTE: ...]
    const matchGeneral = notes.match(/\[COMPROBANTE:\s*(.*?)\]/i)
    if (matchGeneral && matchGeneral[1]) return matchGeneral[1].trim()

    // c. Patrón "Comprobante verificado: ..."
    const matchVerificado = notes.match(/Comprobante(?:\s+verificado)?:\s*(\S+)/i)
    if (matchVerificado && matchVerificado[1]) return matchVerificado[1].trim()

    // d. Ruta a carpeta /uploads/
    const matchUploads = notes.match(/(\/uploads\/[^\s\]\)\n]+)/i)
    if (matchUploads && matchUploads[1]) return matchUploads[1].trim()

    // e. Data URIs de imágenes o PDFs en notas
    const matchDataUri = notes.match(/(data:(?:image|application\/pdf)[^;\s]+;base64,[^\s\]\)\n]+)/i)
    if (matchDataUri && matchDataUri[1]) return matchDataUri[1].trim()

    // f. URLs externas http/https
    const matchUrl = notes.match(/(https?:\/\/[^\s\]\)\n]+)/i)
    if (matchUrl && matchUrl[1]) return matchUrl[1].trim()
  }

  return null
}
