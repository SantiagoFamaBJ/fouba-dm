"use client";

import { useEffect, useState } from "react";
import type { Config, Producto, Seccion } from "@/lib/types";
import { SECCIONES } from "@/lib/types";
import { precio } from "@/lib/format";

type Fila = Producto & { _dirty?: boolean; _saving?: boolean };
type Sec = Seccion & { _dirty?: boolean };

export default function Admin() {
  const [logueado, setLogueado] = useState<boolean | null>(null);
  const [pass, setPass] = useState("");
  const [errLogin, setErrLogin] = useState("");
  const [tab, setTab] = useState<"productos" | "textos">("productos");
  const [filas, setFilas] = useState<Fila[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [secs, setSecs] = useState<Sec[]>([]);
  const [aviso, setAviso] = useState("");

  const avisar = (t: string) => {
    setAviso(t);
    setTimeout(() => setAviso(""), 3500);
  };

  useEffect(() => {
    fetch("/api/admin/login").then((r) => r.json()).then((d) => setLogueado(!!d.ok));
  }, []);

  const cargar = async () => {
    const r = await fetch("/api/admin/productos");
    const d = await r.json();
    if (!r.ok) return avisar("⚠️ " + (d.error || "Error al cargar"));
    setFilas(d);
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase.from("fouba_config").select("*").eq("id", 1).maybeSingle();
    setConfig(data as Config);
    const { data: ss, error: es } = await supabase.from("fouba_secciones").select("*").order("orden");
    setSecs(!es && ss?.length ? (ss as Sec[]) : SECCIONES);
  };

  useEffect(() => {
    if (logueado) cargar();
  }, [logueado]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pass }) });
    if (r.ok) setLogueado(true);
    else setErrLogin("Contraseña incorrecta");
  };

  const salir = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setLogueado(false);
  };

  const cambiar = (id: number, campo: keyof Producto, valor: unknown) =>
    setFilas((fs) => fs.map((f) => (f.id === id ? { ...f, [campo]: valor, _dirty: true } : f)));

  const guardar = async (f: Fila) => {
    setFilas((fs) => fs.map((x) => (x.id === f.id ? { ...x, _saving: true } : x)));
    const { _dirty, _saving, ...body } = f;
    const r = await fetch("/api/admin/productos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) {
      avisar("⚠️ " + (d.error || "No se pudo guardar"));
      setFilas((fs) => fs.map((x) => (x.id === f.id ? { ...x, _saving: false } : x)));
      return;
    }
    setFilas((fs) => fs.map((x) => (x.id === f.id ? d : x)));
    avisar("✅ Guardado");
  };

  const guardarTodo = async () => {
    for (const f of filas.filter((x) => x._dirty)) await guardar(f);
  };

  const borrar = async (f: Fila) => {
    if (!confirm(`¿Borrar "${f.nombre}"? No se puede deshacer.`)) return;
    const r = await fetch(`/api/admin/productos?id=${f.id}`, { method: "DELETE" });
    if (r.ok) {
      setFilas((fs) => fs.filter((x) => x.id !== f.id));
      avisar("🗑️ Borrado");
    } else avisar("⚠️ No se pudo borrar");
  };

  const nuevo = async (seccion: string) => {
    const orden = Math.max(0, ...filas.map((f) => f.orden)) + 1;
    const r = await fetch("/api/admin/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seccion, nombre: "Nuevo producto", detalle: "", precio: 0, precio_tachado: null, desde: false, badge: null, imagen: null, orden, visible: false }),
    });
    const d = await r.json();
    if (!r.ok) return avisar("⚠️ " + (d.error || "No se pudo crear"));
    setFilas((fs) => [...fs, d]);
    avisar("➕ Creado (oculto hasta que lo actives)");
  };

  const mover = async (seccion: string, idx: number, dir: -1 | 1) => {
    const lista = filas.filter((f) => f.seccion === seccion).sort((a, b) => a.orden - b.orden);
    const j = idx + dir;
    if (j < 0 || j >= lista.length) return;
    const a = lista[idx], b = lista[j];
    const cambios = [{ id: a.id, orden: b.orden }, { id: b.id, orden: a.orden }];
    if (a.orden === b.orden) cambios[1].orden = a.orden + dir * -1;
    setFilas((fs) => fs.map((f) => { const c = cambios.find((x) => x.id === f.id); return c ? { ...f, orden: c.orden } : f; }));
    await fetch("/api/admin/productos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cambios) });
  };

  const subirFoto = async (f: Fila, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    avisar("⏳ Subiendo foto…");
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) return avisar("⚠️ " + (d.error || "No se pudo subir"));
    cambiar(f.id, "imagen", d.url);
    avisar("📷 Foto subida, tocá Guardar");
  };

  const cambiarSec = (id: string, campo: keyof Seccion, valor: unknown) =>
    setSecs((ss) => ss.map((x) => (x.id === id ? { ...x, [campo]: valor, _dirty: true } : x)));

  const guardarSec = async (sec: Sec) => {
    const { _dirty, ...body } = sec;
    const r = await fetch("/api/admin/secciones", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) return avisar("⚠️ " + (d.error || "No se pudo guardar el grupo"));
    setSecs((ss) => ss.map((x) => (x.id === sec.id ? { ...x, _dirty: false } : x)));
    avisar("✅ Grupo guardado");
  };

  const moverSec = async (idx: number, dir: -1 | 1) => {
    const lista = [...secs].sort((a, b) => a.orden - b.orden);
    const j = idx + dir;
    if (j < 0 || j >= lista.length) return;
    [lista[idx], lista[j]] = [lista[j], lista[idx]];
    const nueva = lista.map((x, i) => ({ ...x, orden: i + 1 }));
    setSecs(nueva);
    const r = await fetch("/api/admin/secciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nueva.map((x) => ({ id: x.id, orden: x.orden }))),
    });
    if (!r.ok) avisar("⚠️ No se pudo guardar el orden de los grupos");
  };

  const guardarConfig = async () => {
    if (!config) return;
    const r = await fetch("/api/admin/config", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    avisar(r.ok ? "✅ Textos guardados" : "⚠️ No se pudieron guardar los textos");
  };

  if (logueado === null) return <div className="p-10 text-center text-gray-400">Cargando…</div>;

  if (!logueado)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
          <img src="/logo-dm.png" alt="Dental Medrano" className="mx-auto h-10" />
          <h1 className="mt-4 text-center font-display text-lg font-extrabold">Admin · Promos FOUBA</h1>
          <input
            type="password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setErrLogin(""); }}
            placeholder="Contraseña"
            autoFocus
            className="mt-5 w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-[#f15922]"
          />
          {errLogin && <p className="mt-2 text-sm text-red-600">{errLogin}</p>}
          <button className="mt-4 w-full rounded-xl bg-[#f15922] py-3 font-display font-bold text-white">Entrar</button>
        </form>
      </div>
    );

  const pendientes = filas.filter((f) => f._dirty).length;

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo-dm.png" alt="" className="h-7" />
            <span className="hidden font-display text-sm font-extrabold sm:inline">Promos FOUBA</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a href="/" target="_blank" className="rounded-lg border px-3 py-1.5 font-semibold">Ver landing</a>
            <button onClick={salir} className="rounded-lg px-3 py-1.5 text-gray-500">Salir</button>
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 px-4">
          {(["productos", "textos"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`border-b-2 px-3 py-2 font-display text-sm font-bold capitalize ${tab === t ? "border-[#f15922] text-[#f15922]" : "border-transparent text-gray-500"}`}>
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-5">
        {tab === "textos" && config && (
          <div className="space-y-4 rounded-2xl bg-white p-5">
            <div className={`flex items-center justify-between gap-4 rounded-xl p-4 ${config.finalizado ? "bg-red-50 ring-2 ring-red-300" : "bg-gray-50"}`}>
              <div>
                <p className="font-display font-extrabold">Promo finalizada</p>
                <p className="text-sm text-gray-500">Si está activado, la landing deja de mostrar productos y muestra solo el mensaje de cierre.</p>
              </div>
              <label className="flex shrink-0 cursor-pointer items-center gap-2 font-semibold">
                <input type="checkbox" className="h-5 w-5 accent-red-500" checked={!!config.finalizado} onChange={(e) => setConfig({ ...config, finalizado: e.target.checked })} />
                {config.finalizado ? "Activada" : "Desactivada"}
              </label>
            </div>
            {([
              ["titulo", "Título"],
              ["subtitulo", "Bajada"],
              ["fechas", "Fechas"],
              ["link_sorteo", "Link del sorteo (vacío = sin banner)"],
              ["sorteo_titulo", "Banner sorteo · título"],
              ["sorteo_texto", "Banner sorteo · texto"],
              ["sorteo_boton", "Banner sorteo · texto del botón"],
              ["legal", "Leyenda legal del pie"],
              ["finalizado_texto", "Mensaje de promo finalizada"],
            ] as const).map(([k, label]) => (
              <label key={k} className="block">
                <span className="text-sm font-semibold text-gray-600">{label}</span>
                {k === "legal" || k === "finalizado_texto" || k === "sorteo_texto" ? (
                  <textarea value={config[k] || ""} onChange={(e) => setConfig({ ...config, [k]: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
                ) : (
                  <input value={config[k] || ""} onChange={(e) => setConfig({ ...config, [k]: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2" />
                )}
              </label>
            ))}
            <button onClick={guardarConfig} className="rounded-xl bg-[#f15922] px-5 py-2.5 font-display font-bold text-white">Guardar textos</button>
          </div>
        )}

        {tab === "productos" &&
          [...secs].sort((a, b) => a.orden - b.orden).map((s, si, arr) => {
            const lista = filas.filter((f) => f.seccion === s.id).sort((a, b) => a.orden - b.orden);
            return (
              <section key={s.id} className="mb-8">
                <div className={`mb-3 rounded-2xl border-l-8 bg-white p-3 shadow-sm ${s._dirty ? "ring-2 ring-amber-300" : ""} ${s.visible ? "" : "opacity-60"}`} style={{ borderColor: s.color }}>
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col">
                      <button disabled={si === 0} onClick={() => moverSec(si, -1)} className="rounded-md px-2 py-0.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Subir grupo">▲</button>
                      <button disabled={si === arr.length - 1} onClick={() => moverSec(si, 1)} className="rounded-md px-2 py-0.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30" title="Bajar grupo">▼</button>
                    </div>
                    <div className="grid flex-1 gap-2">
                      <input value={s.titulo} onChange={(e) => cambiarSec(s.id, "titulo", e.target.value)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 font-display font-black uppercase italic" style={{ color: s.color }} />
                      <input value={s.bajada || ""} onChange={(e) => cambiarSec(s.id, "bajada", e.target.value)} placeholder="Bajada (opcional), ej: 10% OFF en todos los productos" className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm" />
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <label className="flex items-center gap-1.5">Color <input type="color" value={s.color} onChange={(e) => cambiarSec(s.id, "color", e.target.value)} className="h-7 w-9 rounded" /></label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" checked={s.visible} onChange={(e) => cambiarSec(s.id, "visible", e.target.checked)} /> Grupo visible</label>
                        <span className="text-gray-400">{lista.length} productos</span>
                        <div className="ml-auto flex gap-2">
                          <button onClick={() => nuevo(s.id)} className="rounded-lg border px-3 py-1.5 font-bold">+ Agregar</button>
                          <button disabled={!s._dirty} onClick={() => guardarSec(s)} className="rounded-lg bg-[#f15922] px-3 py-1.5 font-bold text-white disabled:bg-gray-200 disabled:text-gray-400">Guardar grupo</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {lista.map((f, i) => (
                    <div key={f.id} className={`rounded-2xl bg-white p-3 shadow-sm ring-2 ${f._dirty ? "ring-amber-300" : "ring-transparent"} ${f.visible ? "" : "opacity-60"}`}>
                      <div className="flex gap-3">
                        <label className="relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-200" title="Cambiar foto">
                          {f.imagen ? <img src={f.imagen} alt="" className="max-h-full max-w-full object-contain p-1" /> : <span className="text-xs text-gray-400">Sin foto</span>}
                          <span className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 text-center text-[10px] font-bold text-white">Cambiar</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && subirFoto(f, e.target.files[0])} />
                        </label>
                        <div className="grid flex-1 gap-2 sm:grid-cols-2">
                          <input value={f.nombre} onChange={(e) => cambiar(f.id, "nombre", e.target.value)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 font-semibold sm:col-span-2" placeholder="Nombre" />
                          <input value={f.detalle || ""} onChange={(e) => cambiar(f.id, "detalle", e.target.value)} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm sm:col-span-2" placeholder="Detalle (opcional)" />
                          <label className="flex items-center gap-2 text-sm">
                            <span className="w-16 shrink-0 text-gray-500">Precio</span>
                            <input type="number" inputMode="numeric" value={f.precio} onChange={(e) => cambiar(f.id, "precio", Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 font-bold" />
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <span className="w-16 shrink-0 text-gray-500">Tachado</span>
                            <input type="number" inputMode="numeric" value={f.precio_tachado ?? ""} onChange={(e) => cambiar(f.id, "precio_tachado", e.target.value === "" ? null : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5" placeholder="sin tachado" />
                            <button type="button" onClick={() => cambiar(f.id, "precio_tachado", Math.round(f.precio / 0.9))} className="shrink-0 rounded-md bg-gray-100 px-2 py-1.5 text-xs font-bold" title="Precio ÷ 0,9">+10%</button>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <span className="w-16 shrink-0 text-gray-500">Badge</span>
                            <input value={f.badge || ""} onChange={(e) => cambiar(f.id, "badge", e.target.value || null)} className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5" placeholder="ej: 10% OFF" />
                          </label>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <label className="flex items-center gap-1.5"><input type="checkbox" checked={f.desde} onChange={(e) => cambiar(f.id, "desde", e.target.checked)} /> Desde</label>
                            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!f.c_u} onChange={(e) => cambiar(f.id, "c_u", e.target.checked)} /> C/U</label>
                            <label className="flex items-center gap-1.5"><input type="checkbox" checked={!!f.agotado} onChange={(e) => cambiar(f.id, "agotado", e.target.checked)} /> Agotado</label>
                            <label className="flex items-center gap-1.5"><input type="checkbox" checked={f.visible} onChange={(e) => cambiar(f.id, "visible", e.target.checked)} /> Visible</label>
                            <select value={f.seccion} onChange={(e) => cambiar(f.id, "seccion", e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1">
                              {secs.map((x) => <option key={x.id} value={x.id}>{x.titulo}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t pt-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => mover(s.id, i, -1)} className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100" title="Subir">▲</button>
                          <button onClick={() => mover(s.id, i, 1)} className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100" title="Bajar">▼</button>
                          <span className="ml-2 text-xs text-gray-400">
                            {f.precio_tachado ? <><s>{precio(f.precio_tachado)}</s> → </> : null}<b className="text-gray-700">{precio(f.precio)}{f.c_u ? " c/u" : ""}</b>{f.agotado ? <span className="ml-1 font-bold text-red-500">· AGOTADO</span> : null}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => borrar(f)} className="rounded-md px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">Borrar</button>
                          <button disabled={!f._dirty || f._saving} onClick={() => guardar(f)} className="rounded-lg bg-[#f15922] px-3 py-1.5 text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-400">
                            {f._saving ? "Guardando…" : "Guardar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
      </main>

      {pendientes > 0 && tab === "productos" && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white p-3 shadow-lg">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <span className="text-sm font-semibold">{pendientes} cambio{pendientes > 1 ? "s" : ""} sin guardar</span>
            <button onClick={guardarTodo} className="rounded-xl bg-[#f15922] px-5 py-2.5 font-display font-bold text-white">Guardar todo</button>
          </div>
        </div>
      )}

      {aviso && <div className="fixed left-1/2 top-4 z-40 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">{aviso}</div>}
    </div>
  );
}
