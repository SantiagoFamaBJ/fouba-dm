export const precio = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");
export const ahorro = (p: number, t: number | null) =>
  t && t > p ? Math.round((1 - p / t) * 100) : 0;
