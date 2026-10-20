import type { Metadata, Viewport } from "next";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import "@fontsource/montserrat/800-italic.css";
import "@fontsource/montserrat/900-italic.css";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Promos FOUBA 80 años | Dental Medrano",
  description: "Promociones exclusivas de Dental Medrano en el stand del Congreso FOUBA 80 años.",
};

export const viewport: Viewport = { themeColor: "#f15922" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="antialiased">
      <body className="min-h-screen font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
