export type Producto = {
  id: number;
  slug: string;
  seccion: string;
  nombre: string;
  detalle: string | null;
  precio: number;
  precio_tachado: number | null;
  desde: boolean;
  badge: string | null;
  imagen: string | null;
  orden: number;
  visible: boolean;
};

export type Config = {
  id: number;
  titulo: string;
  subtitulo: string;
  fechas: string;
  link_sorteo: string;
  legal: string;
};

export const SECCIONES: { id: string; titulo: string; bajada?: string; color: string }[] = [
  { id: "destacada", titulo: "Oferta destacada", color: "#1597d4" },
  { id: "combos", titulo: "Combos y promo congreso", bajada: "Kits armados para el stand", color: "#f15922" },
  { id: "densell", titulo: "Línea Densell", bajada: "10% OFF en todos los productos", color: "#f15922" },
  { id: "coltene", titulo: "Línea Coltene", bajada: "10% OFF en todos los productos", color: "#1597d4" },
  { id: "seleccionados", titulo: "Seleccionados", color: "#1d2b6b" },
  { id: "precision", titulo: "Trabajá con mayor precisión", color: "#1597d4" },
];
