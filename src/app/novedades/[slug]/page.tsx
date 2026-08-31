import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Newspaper, Paperclip } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { db } from "@/lib/db"
import { getBaseUrl } from "@/lib/emails"
import { OfficialLogo } from "@/components/OfficialLogo"

interface NovedadPageProps {
  params: Promise<{ slug: string }>
}

async function getPublishedNovedad(slug: string) {
  return db.novedad.findFirst({
    where: { slug, isPublished: true },
    include: {
      attachments: {
        select: { id: true, fileName: true, fileMimeType: true },
      },
    },
  })
}

function getMetadataImage(imageUrl: string | null, baseUrl: string) {
  if (!imageUrl || imageUrl.startsWith("data:")) return undefined
  return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : imageUrl
}

export async function generateMetadata({ params }: NovedadPageProps): Promise<Metadata> {
  const { slug } = await params
  const novedad = await getPublishedNovedad(slug)
  if (!novedad) return { title: "Novedad no encontrada | Centro Amigos del Tango" }

  const baseUrl = getBaseUrl()
  const description = (novedad.subtitle || novedad.content)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180)
  const url = `${baseUrl}/novedades/${novedad.slug}`
  const image = getMetadataImage(novedad.imageUrl, baseUrl)

  return {
    title: `${novedad.title} | Centro Amigos del Tango`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "es_AR",
      url,
      title: novedad.title,
      description,
      publishedTime: novedad.publishedAt.toISOString(),
      images: image ? [{ url: image, alt: novedad.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: novedad.title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function NovedadPage({ params }: NovedadPageProps) {
  const { slug } = await params
  const novedad = await getPublishedNovedad(slug)
  if (!novedad) notFound()

  const publishedDate = format(new Date(novedad.publishedAt), "d 'de' MMMM, yyyy", { locale: es })

  return (
    <main className="min-h-screen bg-[#131313] text-[#e4e2e0]">
      <header className="border-b border-white/5 bg-[#1b2621]/90 px-6 py-4 backdrop-blur-xl md:px-16">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/novedades"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Volver a novedades
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <OfficialLogo compact className="h-9 w-9" />
            <span className="hidden text-sm font-semibold text-white sm:inline">Centro Amigos del Tango</span>
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="mb-7 flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-400">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-400">
            <Newspaper size={13} />
            Novedad CAT
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={13} />
            {publishedDate}
          </span>
        </div>

        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
          {novedad.title}
        </h1>
        {novedad.subtitle && (
          <p className="mt-4 font-serif text-lg font-semibold leading-relaxed text-amber-300 sm:text-2xl">
            {novedad.subtitle}
          </p>
        )}

        {novedad.imageUrl && (
          <div className="mt-9 aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
            <img
              src={novedad.imageUrl}
              alt={novedad.title}
              className="h-full w-full object-contain"
            />
          </div>
        )}

        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="whitespace-pre-line text-base font-light leading-8 text-zinc-300 sm:text-lg">
            {novedad.content}
          </div>
        </div>

        {novedad.attachments.length > 0 && (
          <section className="mt-10 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Paperclip size={16} />
              Archivos adjuntos
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {novedad.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={`/api/novedades/${novedad.id}/archivos/${attachment.id}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
                >
                  <Paperclip size={15} className="text-amber-400" />
                  {attachment.fileName}
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  )
}
