import Link from "next/link"
import { EnrollmentForm } from "./EnrollmentForm"
import { Sparkles, Heart, ChevronLeft, CreditCard } from "lucide-react"

export default function AsociatePage() {
  return (
    <div className="bg-[#131313] text-[#e4e2e0] min-h-screen selection:bg-cat-gold/30 font-sans relative overflow-x-hidden">
      
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-[#1b2621]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <nav className="flex justify-between items-center px-6 md:px-16 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cat-gold to-cat-bronze flex items-center justify-center shadow-lg shadow-cat-gold/20">
              <span className="font-black text-lg text-zinc-950">C</span>
            </div>
            <span className="font-bold text-lg tracking-wider text-white">CAT</span>
          </Link>
          
          <div>
            <Link 
              href="/" 
              className="text-zinc-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 active:scale-95"
            >
              <ChevronLeft size={14} />
              <span>Volver al Inicio</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-20">
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-[#1B2621] to-[#131313] py-20 text-center">
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16">
            <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6 font-serif">
              Asociate al <span className="bg-gradient-to-r from-cat-gold to-cat-bronze bg-clip-text text-transparent">Centro Amigos del Tango</span>
            </h1>
            <p className="text-sm md:text-lg text-zinc-400 max-w-2xl mx-auto font-light">
              Formá parte de la comunidad tanguera más grande de la Patagonia y colaborá con el fomento del tango y la cultura.
            </p>
          </div>
        </section>

        {/* Beneficios Section */}
        <section className="py-16 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Beneficios Directos */}
            <div className="bg-[#1b2621]/40 border border-white/5 p-8 md:p-10 rounded-2xl shadow-xl backdrop-blur-md">
              <h2 className="text-xl font-bold text-cat-gold mb-6 flex items-center gap-3 font-serif">
                <Sparkles className="w-5 h-5 text-cat-gold" />
                <span>Beneficios Directos</span>
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cat-gold shrink-0" />
                  <span className="text-sm text-zinc-300 font-light">Descuentos exclusivos en nuestra Milonga Mensual Sabatina.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cat-gold shrink-0" />
                  <span className="text-sm text-zinc-300 font-light">Prioridad y precios diferenciales en Seminarios y Talleres con maestros invitados.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cat-gold shrink-0" />
                  <span className="text-sm text-zinc-300 font-light">Descuentos especiales en artículos de merchandise y vestimenta del CAT.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cat-gold shrink-0" />
                  <span className="text-sm text-zinc-300 font-light">Suscripción al Newsletter exclusivo de socios con preventas y agendas.</span>
                </li>
              </ul>
            </div>

            {/* Beneficios Indirectos */}
            <div className="bg-[#1b2621]/40 border border-white/5 p-8 md:p-10 rounded-2xl shadow-xl backdrop-blur-md">
              <h2 className="text-xl font-bold text-cat-gold mb-6 flex items-center gap-3 font-serif">
                <Heart className="w-5 h-5 text-cat-gold" />
                <span>Beneficios Indirectos</span>
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cat-gold shrink-0" />
                  <span className="text-sm text-zinc-300 font-light">Aporte al sostenimiento legal y administrativo de la asociación.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cat-gold shrink-0" />
                  <span className="text-sm text-zinc-300 font-light">Fomento de la organización de eventos y milongas regionales en la Patagonia.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cat-gold shrink-0" />
                  <span className="text-sm text-zinc-300 font-light">Sostenimiento de la "Escuelita del CAT" para dar clases de tango gratuitas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cat-gold shrink-0" />
                  <span className="text-sm text-zinc-300 font-light">Impulso al Campeonato Patagónico de Tango anual.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Stepper Section */}
        <section className="py-16 bg-zinc-950 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 font-serif text-white">Instrucciones para asociarse</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Paso 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cat-gold text-zinc-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-cat-gold/25">1</div>
                <h3 className="text-base font-bold text-white">Completar Formulario</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">Completá todos los campos obligatorios (*) y adjuntá comprobante de pago de la primera cuota social.</p>
              </div>
              
              {/* Paso 2 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cat-gold text-zinc-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-cat-gold/25">2</div>
                <h3 className="text-base font-bold text-white">Email de Confirmación</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">Recibirás un email de bienvenida automático en tu casilla confirmando la información enviada.</p>
              </div>

              {/* Paso 3 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cat-gold text-zinc-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-cat-gold/25">3</div>
                <h3 className="text-base font-bold text-white">Alta como Socio</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">Tesorería verificará el pago y te notificará por email tu nuevo N° de socio asignado y credenciales.</p>
              </div>

              {/* Paso 4 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cat-gold text-zinc-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-cat-gold/25">4</div>
                <h3 className="text-base font-bold text-white">Nueva Contraseña</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">Una vez que ingreses al sistema por primera vez, deberás establecer una contraseña nueva.</p>
              </div>

              {/* Paso 5 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cat-gold text-zinc-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-cat-gold/25">5</div>
                <h3 className="text-base font-bold text-white font-serif">¡Bienvenid@!</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">¡Listo! Ya podés disfrutar de las milongas y eventos organizados por el CAT.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Información Bancaria */}
        <section className="py-16 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="bg-[#1b2621]/20 border border-white/5 p-8 md:p-12 rounded-2xl max-w-3xl mx-auto shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center font-serif flex items-center justify-center gap-2">
              <CreditCard className="text-cat-gold" />
              <span>Información para Transferencia</span>
            </h2>
            
            <div className="flex justify-center mb-8">
              <div className="bg-cat-gold/10 border border-cat-gold/20 px-6 py-2.5 rounded-full text-sm font-bold text-cat-gold">
                Valor cuota mensual: $ 10.000
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/5">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="p-4 bg-white/[0.02] font-semibold text-cat-gold w-1/3">Titular / Nombre</td>
                    <td className="p-4 text-zinc-200">CENTRO AMIGOS DEL TANGO</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4 bg-white/[0.02] font-semibold text-cat-gold">CUIT</td>
                    <td className="p-4 text-zinc-200 font-mono">30709437069</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4 bg-white/[0.02] font-semibold text-cat-gold">Banco</td>
                    <td className="p-4 text-zinc-200">Banco del Chubut S.A.</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4 bg-white/[0.02] font-semibold text-cat-gold">CBU</td>
                    <td className="p-4 text-zinc-200 font-mono">0830006503002033950018</td>
                  </tr>
                  <tr>
                    <td className="p-4 bg-white/[0.02] font-semibold text-cat-gold">Alias</td>
                    <td className="p-4 text-zinc-200 font-bold">AMIGOSDELTANGO</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section id="registro" className="py-16 px-6 md:px-16 max-w-7xl mx-auto mb-20">
          <div className="bg-gradient-to-b from-[#59412c]/40 to-[#59412c]/20 border border-white/5 p-8 md:p-16 rounded-3xl max-w-3xl mx-auto shadow-2xl backdrop-blur-md">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-serif">Solicitud de Inscripción</h2>
              <p className="text-xs md:text-sm text-zinc-400 font-light">
                Completá todos tus datos a continuación y adjuntá tu comprobante para iniciar tu alta.
              </p>
            </div>
            
            <EnrollmentForm />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-white/5 py-12 px-6 md:px-16 text-center">
        <p className="text-xs text-zinc-500 font-light">
          © {new Date().getFullYear()} Centro Amigos del Tango. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
