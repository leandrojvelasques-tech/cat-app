import { Calendar, FileText, MessageSquareText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type MemberCommunication = {
  id: string
  title: string
  description: string
  fileUrl: string
  fileName: string
  publishedAt: Date | null
}

export function SocioCommunicationsSection({ communications }: { communications: MemberCommunication[] }) {
  if (!communications || communications.length === 0) return null

  return (
    <section className="bg-white/5 border border-amber-500/20 p-8 md:p-10 rounded-[48px] backdrop-blur-md shadow-2xl space-y-8">
      <div className="flex items-start gap-4 border-b border-white/10 pb-6">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0"><MessageSquareText size={22} /></div>
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Comunicaciones a socios</h2>
          <p className="text-xs text-zinc-400 mt-1">Gestiones y decisiones informadas por la Comisión Directiva.</p>
        </div>
      </div>

      <div className="space-y-4">
        {communications.map((communication) => (
          <article key={communication.id} className="bg-zinc-950/70 border border-white/10 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-amber-500/40 transition-colors">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] text-amber-400 uppercase tracking-widest font-black"><Calendar size={12} /> {communication.publishedAt ? format(new Date(communication.publishedAt), "dd 'de' MMMM 'de' yyyy", { locale: es }) : "Comunicación institucional"}</div>
              <h3 className="text-lg font-black text-white mt-2 leading-tight">{communication.title}</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed whitespace-pre-line">{communication.description}</p>
            </div>
            <a href={communication.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 shrink-0 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-colors">
              <FileText size={16} /> Ver documento
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
