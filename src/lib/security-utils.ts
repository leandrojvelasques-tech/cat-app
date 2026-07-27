import { randomUUID } from "crypto"

export interface FileValidationResult {
  isValid: boolean
  error?: string
  mimeType?: string
  extension?: string
  safeFileName?: string
}

/**
 * Validador de seguridad defensiva para comprobantes y archivos subidos por usuarios.
 * Inspecciona los Magic Bytes del Buffer para garantizar que el contenido real coincida
 * con formatos estáticos permitidos (JPEG, PNG, WEBP, PDF) y descarta cualquier ejecutable/script.
 */
export async function validateAndSanitizeFile(
  buffer: Buffer,
  clientMimeType?: string
): Promise<FileValidationResult> {
  // 1. Límite estricto de tamaño: Máximo 5MB
  const MAX_SIZE = 5 * 1024 * 1024
  if (buffer.length > MAX_SIZE) {
    return {
      isValid: false,
      error: "El archivo excede el tamaño máximo permitido de 5MB."
    }
  }

  if (buffer.length < 4) {
    return {
      isValid: false,
      error: "Archivo corrupto o incompleto."
    }
  }

  // 2. Inspección de Magic Bytes binarios (Firmas de archivos verdaderas)
  const header = buffer.subarray(0, 12).toString("hex").toUpperCase()

  let detectedMime: string | null = null
  let extension: string | null = null

  // JPEG: FF D8 FF
  if (header.startsWith("FFD8FF")) {
    detectedMime = "image/jpeg"
    extension = "jpg"
  }
  // PNG: 89 50 4E 47
  else if (header.startsWith("89504E47")) {
    detectedMime = "image/png"
    extension = "png"
  }
  // WEBP: RIFF .... WEBP (RIFF = 52494646, WEBP = 57454250 en pos 8-11)
  else if (header.startsWith("52494646") && header.includes("57454250")) {
    detectedMime = "image/webp"
    extension = "webp"
  }
  // PDF: 25 50 44 46 (%PDF)
  else if (header.startsWith("25504446")) {
    detectedMime = "application/pdf"
    extension = "pdf"
  }

  if (!detectedMime || !extension) {
    return {
      isValid: false,
      error: "Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, WebP) o documentos PDF."
    }
  }

  // 3. Sanitización de nombre de archivo (Generar nombre limpio con UUID v4)
  const safeFileName = `comprobante-${randomUUID()}-${Date.now()}.${extension}`

  return {
    isValid: true,
    mimeType: detectedMime,
    extension,
    safeFileName
  }
}
