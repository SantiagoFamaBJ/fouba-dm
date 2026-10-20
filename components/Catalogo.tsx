"use client";

import { useEffect, useMemo, useState } from "react";
import type { Config, Producto } from "@/lib/types";
import { SECCIONES } from "@/lib/types";
import { ahorro, precio } from "@/lib/format";

const normalizar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function Catalogo({ productos, config }: { productos: Producto[]; config: Config }) {
  const [q, setQ] = useState("");
  const [activa, setActiva] = useState<string>("");

  const filtrados = useMemo(() => {
    const t = normalizar(q.trim());
    if (!t) return productos;
    return productos.filter((p) => normalizar(`${p.nombre} ${p.detalle || ""}`).includes(t));
  }, [q, productos]);

  const secciones = SECCIONES.map((s) => ({ ...s, items: filtrados.filter((p) => p.seccion === s.id) })).filter(
    (s) => s.items.length > 0
  );

  // resalta el chip de la sección visible
  useEffect(() => {
    const els = secciones.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const v = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (v) setActiva(v.target.id);
      },
      { rootMargin: "-130px 0px -55% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [secciones.map((s) => s.id).join(",")]);

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
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-display text-sm font-bold text-[#f15922]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                {config.fechas}
              </span>
              {config.link_sorteo && (
                <a
                  href={config.link_sorteo}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1d2b6b] px-4 py-2 font-display text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-[#15204f]"
                >
                  🎁 Participá del sorteo
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* NAV + BUSCADOR */}
      <nav className="sticky top-0 z-20 border-b border-black/5 bg-white/95 backdrop-blur">
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

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        {secciones.length === 0 && (
          <p className="py-20 text-center text-gray-500">No encontramos productos con “{q}”.</p>
        )}

        {secciones.map((s) => (
          <section key={s.id} id={s.id} className="mb-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl font-black uppercase italic tracking-tight sm:text-3xl" style={{ color: s.color }}>
                  {s.titulo}
                </h2>
                {s.bajada && <p className="mt-0.5 text-sm font-semibold text-gray-500">{s.bajada}</p>}
              </div>
            </div>

            {s.id === "destacada" ? (
              <div className="grid gap-4">
                {s.items.map((p) => <Destacada key={p.id} p={p} />)}
              </div>
            ) : s.id === "combos" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {s.items.map((p, i) => <Combo key={p.id} p={p} color={["#5f8f2a", "#1597d4", "#1597d4", "#f15922", "#f15922"][i % 5]} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {s.items.map((p) => <Card key={p.id} p={p} color={s.color} />)}
              </div>
            )}
          </section>
        ))}
      </main>

      <footer className="bg-[#f15922] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <img src="/logo-dm-blanco.png" alt="Dental Medrano" className="h-10 w-auto self-start" />
          <p className="max-w-md text-sm leading-relaxed text-white/90">{config.legal}</p>
          <div className="flex flex-col gap-1.5 text-sm font-semibold">
            <a href="https://instagram.com/dentalmedrano" target="_blank" rel="noreferrer" className="hover:underline">@dentalmedrano</a>
            <a href="https://www.dentalmedrano.com" target="_blank" rel="noreferrer" className="hover:underline">www.dentalmedrano.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Precios({ p, color, grande = false }: { p: Producto; color: string; grande?: boolean }) {
  return (
    <div>
      {p.desde && <p className="font-display text-[11px] font-bold uppercase tracking-wide text-gray-500">Desde</p>}
      {p.precio_tachado && p.precio_tachado > p.precio && (
        <p className={`font-display font-semibold text-gray-400 line-through ${grande ? "text-lg" : "text-sm"}`}>{precio(p.precio_tachado)}</p>
      )}
      <p className={`font-display font-black leading-none tracking-tight ${grande ? "text-4xl sm:text-5xl" : "text-2xl sm:text-[26px]"}`} style={{ color }}>
        {precio(p.precio)}
      </p>
    </div>
  );
}

function Badge({ texto, color }: { texto: string; color: string }) {
  return (
    <span className="rounded-full px-2.5 py-1 font-display text-[11px] font-extrabold uppercase text-white shadow-sm" style={{ background: color }}>
      {texto}
    </span>
  );
}

function Card({ p, color }: { p: Producto; color: string }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        {p.badge && (
          <div className="absolute left-2.5 top-2.5">
            <Badge texto={p.badge} color={color} />
          </div>
        )}
        {p.imagen && <img src={p.imagen} alt={p.nombre} loading="lazy" className="max-h-full max-w-full object-contain" />}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5 pt-2">
        <div>
          <h3 className="font-display text-[13px] font-extrabold uppercase leading-tight text-gray-900 sm:text-sm">{p.nombre}</h3>
          {p.detalle && <p className="mt-0.5 text-sm leading-snug text-gray-500">{p.detalle}</p>}
        </div>
        <Precios p={p} color={color} />
      </div>
    </article>
  );
}

function Combo({ p, color }: { p: Producto; color: string }) {
  const [titulo, sub] = p.nombre.split(" · ");
  const pct = ahorro(p.precio, p.precio_tachado);
  return (
    <article className="relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white sm:flex-row" style={{ borderColor: color }}>
      <div className="relative flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-5 sm:w-[46%]">
        <img src={p.imagen || ""} alt={p.nombre} loading="lazy" className="max-h-44 w-auto max-w-full object-contain" />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md px-2 py-0.5 font-display text-[11px] font-extrabold uppercase text-white" style={{ background: color }}>
              {titulo}
            </span>
          </div>
          <h3 className="mt-2 font-display text-xl font-black uppercase italic leading-tight" style={{ color }}>{sub || titulo}</h3>
          {p.detalle && <p className="mt-1 text-sm font-medium leading-snug text-gray-600">{p.detalle}</p>}
        </div>
        <div className="flex items-end justify-between gap-3">
          <Precios p={p} color={color} grande />
          {p.badge ? (
            <span className="font-display text-4xl font-black italic leading-none" style={{ color }}>{p.badge.replace(" OFF", "")}</span>
          ) : pct ? (
            <span className="font-display text-4xl font-black italic leading-none" style={{ color }}>{pct}%</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Destacada({ p }: { p: Producto }) {
  const [sub, extra] = (p.detalle || "").split(" · ");
  return (
    <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e8f6fd] to-white ring-2 ring-[#1597d4]">
      <div className="grid items-center gap-2 p-5 sm:grid-cols-[1.1fr_1fr] sm:p-7">
        <img src={p.imagen || ""} alt={p.nombre} className="mx-auto max-h-48 w-auto object-contain sm:max-h-56" />
        <div>
          <h3 className="font-display text-3xl font-black uppercase italic leading-none text-[#1597d4] sm:text-4xl">{p.nombre}</h3>
          {sub && <p className="mt-1 font-display text-sm font-bold text-gray-800">{sub}</p>}
          <div className="mt-4 flex items-end gap-4">
            {p.badge && <span className="font-display text-6xl font-black italic leading-[0.8] text-[#1597d4] sm:text-7xl">{p.badge}</span>}
            <div>
              {extra && <p className="font-display text-sm font-extrabold italic leading-tight text-[#1597d4]">{extra}</p>}
              <div className="mt-1"><Precios p={{ ...p, desde: false }} color="#1597d4" grande /></div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
