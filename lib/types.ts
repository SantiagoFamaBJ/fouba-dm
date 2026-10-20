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
  c_u?: boolean;
  agotado?: boolean;
};

export type Seccion = {
  id: string;
  titulo: string;
  bajada: string | null;
  color: string;
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
  sorteo_titulo?: string;
  sorteo_texto?: string;
  sorteo_boton?: string;
  finalizado?: boolean;
  finalizado_texto?: string;
};

// respaldo si la tabla fouba_secciones todavía no existe
export const SECCIONES: Seccion[] = [
  { id: "destacada", titulo: "Oferta destacada", color: "#1597d4", bajada: "", orden: 1, visible: true },
  { id: "combos", titulo: "Combos y promo congreso", bajada: "Kits armados para el stand", color: "#f15922", orden: 2, visible: true },
  { id: "densell", titulo: "Línea Densell", bajada: "10% OFF en todos los productos", color: "#f15922", orden: 3, visible: true },
  { id: "coltene", titulo: "Línea Coltene", bajada: "10% OFF en todos los productos", color: "#1597d4", orden: 4, visible: true },
  { id: "seleccionados", titulo: "Seleccionados", color: "#1d2b6b", bajada: "", orden: 5, visible: true },
  { id: "precision", titulo: "Trabajá con mayor precisión", color: "#1597d4", bajada: "", orden: 6, visible: true },
];
