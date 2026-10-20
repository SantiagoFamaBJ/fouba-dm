import { supabase } from "@/lib/supabase";
import type { Config, Producto } from "@/lib/types";
import Catalogo from "@/components/Catalogo";

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
  const [{ data: productos }, { data: config }] = await Promise.all([
    supabase.from("fouba_productos").select("*").eq("visible", true).order("orden"),
    supabase.from("fouba_config").select("*").eq("id", 1).maybeSingle(),
  ]);
  return <Catalogo productos={(productos as Producto[]) || []} config={(config as Config) || CONFIG_DEFAULT} />;
}
