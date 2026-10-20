import type { Config } from "@/lib/types";
import Footer from "./Footer";

export default function Finalizado({ config }: { config: Config }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#f15922] via-[#f26a22] to-[#f7941d] px-4 py-16 text-white">
        <div className="max-w-lg text-center">
          <div className="mx-auto inline-block rounded-xl bg-white px-4 py-2.5 shadow-sm">
            <img src="/logo-dm.png" alt="Dental Medrano" className="h-10 w-auto" />
          </div>
          <h1 className="mt-8 font-display text-3xl font-black leading-tight sm:text-4xl">{config.titulo}</h1>
          <p className="mt-4 text-lg text-white/90">
            {config.finalizado_texto || "Las promociones finalizaron. ¡Gracias por visitarnos!"}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="https://www.dentalmedrano.com" className="rounded-full bg-white px-6 py-3 font-display text-sm font-bold text-[#f15922] shadow-lg shadow-black/10">
              Ir a dentalmedrano.com
            </a>
            <a href="https://instagram.com/dentalmedrano" target="_blank" rel="noreferrer" className="rounded-full border-2 border-white px-6 py-3 font-display text-sm font-bold text-white">
              Seguinos en Instagram
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
