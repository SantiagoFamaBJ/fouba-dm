"use client";

import { useEffect, useMemo, useState } from "react";
import type { Config, Producto, Seccion } from "@/lib/types";
import { ahorro, precio } from "@/lib/format";
import Footer from "./Footer";

const normalizar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const COLORES_COMBOS = ["#5f8f2a", "#1597d4", "#1597d4", "#f15922", "#f15922"];

export default function Catalogo({
  productos,
  config,
  secciones: secs,
}: {
  productos: Producto[];
  config: Config;
  secciones: Seccion[];
}) {
  const [q, setQ] = useState("");
  const [activa, setActiva] = useState<string>("");

  const filtrados = useMemo(() => {
    const t = normalizar(q.trim());
    if (!t) return productos;
    return productos.filter((p) => normalizar(`${p.nombre} ${p.detalle || ""}`).includes(t));
  }, [q, productos]);

  const secciones = secs
    .map((s) => ({ ...s, items: filtrados.filter((p) => p.seccion === s.id) }))
    .filter((s) => s.items.length > 0);

  // resalta el chip de la sección visible
  const ids = secciones.map((s) => s.id).join(",");
  useEffect(() => {
    const els = ids.split(",").map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const v = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (v) setActiva(v.target.id);
      },
      { rootMargin: "-130px 0px -55% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#f15922] via-[#f26a22] to-[#f7941d] text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-5">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
              <img src="/logo-dm.png" alt="Dental Medrano" className="h-8 w-auto sm:h-10" />
            </div>
            <span className="rounded-full border border-white/40 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider">
              Stand Dental Medrano
            </span>
          </div>
          <div className="mt-8 max-w-2xl">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-white/80">Promociones exclusivas</p>
            <h1 className="mt-2 font-display text-4xl font-black leading-[1.05] sm:text-6xl">{config.titulo}</h1>
            <p className="mt-3 text-lg text-white/90 sm:text-xl">{config.subtitulo}</p>
            <div className="mt-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-display text-sm font-bold text-[#f15922]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                {config.fechas}
              </span>
            </div>
          </div>
        </div>
      </header>

      {config.link_sorteo && (
        <div className="mx-auto -mt-5 max-w-6xl px-4">
          <BannerSorteo config={config} />
        </div>
      )}

      {/* NAV + BUSCADOR */}
      <nav className="sticky top-0 z-20 mt-5 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar producto…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-base outline-none transition focus:border-[#f15922] focus:bg-white"
            />
          </div>
          <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4">
            {secciones.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 rounded-full px-3.5 py-1.5 font-display text-xs font-bold transition ${
                  activa === s.id ? "text-white" : "bg-gray-100 text-gray-600"
                }`}
                style={activa === s.id ? { background: s.color } : undefined}
              >
                {s.titulo}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
        {secciones.length === 0 && (
          <p className="py-20 text-center text-gray-500">No encontramos productos con “{q}”.</p>
        )}

        {secciones.map((s) => (
          <section key={s.id} id={s.id} className="mb-10">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-black uppercase italic tracking-tight sm:text-3xl" style={{ color: s.color }}>
                {s.titulo}
              </h2>
              {s.bajada && <p className="mt-0.5 text-sm font-semibold text-gray-500">{s.bajada}</p>}
            </div>

            {s.id === "destacada" ? (
              <div className="grid gap-4">
                {s.items.map((p) => <Destacada key={p.id} p={p} color={s.color} />)}
              </div>
            ) : s.id === "combos" ? (
              <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
                {s.items.map((p, i) => (
                  <Combo key={p.id} p={p} color={COLORES_COMBOS[i % COLORES_COMBOS.length]} />
                ))}
              </div>
            ) : (
              <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {s.items.map((p) => <Card key={p.id} p={p} color={s.color} />)}
              </div>
            )}
          </section>
        ))}

        {config.link_sorteo && (
          <div className="mt-4">
            <BannerSorteo config={config} />
          </div>
        )}
      </main>

      <Footer legal={config.legal} />
    </div>
  );
}

function BannerSorteo({ config }: { config: Config }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#1d2b6b] p-5 text-white shadow-xl shadow-[#1d2b6b]/20 sm:p-7">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-[#f15922]/20" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f15922] text-2xl">🎁</div>
          <div>
            <p className="font-display text-lg font-black leading-tight sm:text-xl">
              {config.sorteo_titulo || "¡Girá la ruleta y ganá al instante!"}
            </p>
            <p className="mt-1 text-[15px] leading-snug text-white/80">
              {config.sorteo_texto || "Además, participás por 5 premios grandes que sorteamos al cierre del congreso."}
            </p>
          </div>
        </div>
        <a
          href={config.link_sorteo}
          className="shrink-0 rounded-full bg-[#f15922] px-6 py-3 text-center font-display text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-[#d6461a]"
        >
          {config.sorteo_boton || "Quiero participar"}
        </a>
      </div>
    </div>
  );
}

function CU({ show, grande }: { show?: boolean; grande?: boolean }) {
  if (!show) return null;
  return <span className={`ml-1 font-display font-extrabold ${grande ? "text-base" : "text-xs"}`}>c/u</span>;
}

/** Precios de las cards: reserva siempre el lugar de "Desde" y del tachado para que todas queden alineadas */
function PreciosCard({ p, color }: { p: Producto; color: string }) {
  const tachado = p.precio_tachado && p.precio_tachado > p.precio;
  return (
    <div>
      <p className={`h-4 font-display text-[11px] font-bold uppercase leading-4 tracking-wide text-gray-500 ${p.desde ? "" : "invisible"}`}>Desde</p>
      <p className={`h-5 font-display text-sm font-semibold leading-5 text-gray-400 line-through ${tachado ? "" : "invisible"}`}>
        {tachado ? precio(p.precio_tachado!) : "-"}
      </p>
      <p className="mt-0.5 font-display text-2xl font-black leading-none tracking-tight sm:text-[26px]" style={{ color: p.agotado ? "#9ca3af" : color }}>
        {precio(p.precio)}
        <CU show={p.c_u} />
      </p>
    </div>
  );
}

function PreciosGrande({ p, color }: { p: Producto; color: string }) {
  return (
    <div>
      {p.desde && <p className="font-display text-[11px] font-bold uppercase tracking-wide text-gray-500">Desde</p>}
      {p.precio_tachado && p.precio_tachado > p.precio && (
        <p className="font-display text-lg font-semibold text-gray-400 line-through">{precio(p.precio_tachado)}</p>
      )}
      <p className="font-display text-4xl font-black leading-none tracking-tight sm:text-[42px]" style={{ color: p.agotado ? "#9ca3af" : color }}>
        {precio(p.precio)}
        <CU show={p.c_u} grande />
      </p>
    </div>
  );
}

function Agotado() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <span className="-rotate-6 rounded-lg bg-gray-900/85 px-3 py-1.5 font-display text-sm font-black uppercase tracking-widest text-white">
        Agotado
      </span>
    </div>
  );
}

function Card({ p, color }: { p: Producto; color: string }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        {p.badge && !p.agotado && (
          <span
            className="absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-1 font-display text-[11px] font-extrabold uppercase text-white shadow-sm"
            style={{ background: color }}
          >
            {p.badge}
          </span>
        )}
        {p.agotado && <Agotado />}
        {p.imagen && (
          <img
            src={p.imagen}
            alt={p.nombre}
            loading="lazy"
            className={`h-full w-full object-contain ${p.agotado ? "opacity-40 grayscale" : ""}`}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5 pt-2">
        <h3 className="line-clamp-2 min-h-[2.5em] font-display text-[13px] font-extrabold uppercase leading-[1.25] text-gray-900 sm:text-sm">
          {p.nombre}
        </h3>
        <p className="mt-0.5 line-clamp-2 min-h-[2.5em] text-sm leading-[1.25] text-gray-500">{p.detalle || ""}</p>
        <div className="mt-auto pt-2">
          <PreciosCard p={p} color={color} />
        </div>
      </div>
    </article>
  );
}

function Combo({ p, color }: { p: Producto; color: string }) {
  const [titulo, sub] = p.nombre.split(" · ");
  const pct = ahorro(p.precio, p.precio_tachado);
  const destaque = p.badge ? p.badge.replace(/\s*OFF$/i, "") : pct ? `${pct}%` : "";
  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-white sm:flex-row"
      style={{ borderColor: p.agotado ? "#d1d5db" : color }}
    >
      <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-gray-50 to-white p-5 sm:h-auto sm:w-[46%]">
        {p.agotado && <Agotado />}
        <img
          src={p.imagen || ""}
          alt={p.nombre}
          loading="lazy"
          className={`h-full max-h-44 w-full object-contain ${p.agotado ? "opacity-40 grayscale" : ""}`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <span className="rounded-md px-2 py-0.5 font-display text-[11px] font-extrabold uppercase text-white" style={{ background: p.agotado ? "#9ca3af" : color }}>
            {titulo}
          </span>
          <h3 className="mt-2 font-display text-xl font-black uppercase italic leading-tight" style={{ color: p.agotado ? "#6b7280" : color }}>
            {sub || titulo}
          </h3>
          {p.detalle && <p className="mt-1 text-sm font-medium leading-snug text-gray-600">{p.detalle}</p>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <PreciosGrande p={p} color={color} />
          {destaque && !p.agotado && (
            <span className="font-display text-4xl font-black italic leading-none" style={{ color }}>{destaque}</span>
          )}
        </div>
      </div>
    </article>
  );
}

function Destacada({ p, color }: { p: Producto; color: string }) {
  const [sub, extra] = (p.detalle || "").split(" · ");
  return (
    <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e8f6fd] to-white ring-2" style={{ ["--tw-ring-color" as string]: color }}>
      <div className="grid items-center gap-2 p-5 sm:grid-cols-[1.1fr_1fr] sm:p-7">
        <div className="relative">
          {p.agotado && <Agotado />}
          <img src={p.imagen || ""} alt={p.nombre} className={`mx-auto max-h-48 w-auto object-contain sm:max-h-56 ${p.agotado ? "opacity-40 grayscale" : ""}`} />
        </div>
        <div>
          <h3 className="font-display text-3xl font-black uppercase italic leading-none sm:text-4xl" style={{ color }}>{p.nombre}</h3>
          {sub && <p className="mt-1 font-display text-sm font-bold text-gray-800">{sub}</p>}
          <div className="mt-4 flex items-end gap-4">
            {p.badge && !p.agotado && (
              <span className="font-display text-6xl font-black italic leading-[0.8] sm:text-7xl" style={{ color }}>{p.badge}</span>
            )}
            <div>
              {extra && <p className="font-display text-sm font-extrabold italic leading-tight" style={{ color }}>{extra}</p>}
              <div className="mt-1">
                <PreciosGrande p={{ ...p, desde: false }} color={color} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
