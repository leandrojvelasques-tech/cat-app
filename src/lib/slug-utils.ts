/**
 * Converts a string to a clean URL-friendly slug.
 * Example: "Vientos de Tango 2026! (Edición Especial)" -> "vientos-de-tango-2026-edicion-especial"
 */
export function slugify(text: string): string {
  if (!text) return ""

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/[\s_]+/g, "-")       // Spaces to hyphens
    .replace(/-+/g, "-")          // Collapse hyphens
    .replace(/^-+|-+$/g, "")      // Trim hyphens
}
