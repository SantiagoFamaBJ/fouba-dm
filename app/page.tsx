import { supabase } from "@/lib/supabase";
import type { Config, Producto, Seccion } from "@/lib/types";
import { SECCIONES } from "@/lib/types";
import Catalogo from "@/components/Catalogo";
import Finalizado from "@/components/Finalizado";

export const dynamic = "force-dynamic";

const CONFIG_DEFAULT: Config = {
  id: 1,
  titulo: "Congreso FOUBA 80 años",
  subtitulo: "Promociones exclusivas en el stand de Dental Medrano",
  fechas: "19 al 23 de octubre de 2026",
  link_sorteo: "",
  legal: "Promociones válidas exclusivamente en el stand de Dental Medrano. Precios finales. Imágenes de carácter ilustrativo.",
};

export default async function Home() {
  const [{ data: productos }, { data: config }, { data: secciones, error: errSec }] = await Promise.all([
    supabase.from("fouba_productos").select("*").eq("visible", true).order("orden"),
    supabase.from("fouba_config").select("*").eq("id", 1).maybeSingle(),
    supabase.from("fouba_secciones").select("*").order("orden"),
  ]);
  const cfg = { ...CONFIG_DEFAULT, ...((config as Config) || {}) };
  if (cfg.finalizado) return <Finalizado config={cfg} />;
  const secs = !errSec && secciones?.length ? (secciones as Seccion[]) : SECCIONES;
  return (
    <Catalogo
      productos={(productos as Producto[]) || []}
      config={cfg}
      secciones={secs.filter((s) => s.visible !== false)}
    />
  );
}
