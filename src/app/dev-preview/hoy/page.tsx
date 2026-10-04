import { notFound } from "next/navigation";
import { HoyView } from "@/app/(app)/dashboard/_components/hoy-view";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { DatosHoy } from "@/lib/hoy/queries";

/**
 * SOLO DESARROLLO. Vista previa de "Hoy" con datos FICTICIOS para revisar el diseño sin base de datos.
 * No existe en producción (`notFound()`), no lee ni escribe nada y no usa datos reales de clientes.
 */
const MUESTRA: DatosHoy = {
  hoy: new Date("2026-10-03T00:00:00Z"),
  dineroDisponible: 1_845_000,
  faltaSaldoInicial: false,
  enLaCalle: {
    total: 9_280_000,
    mercancia: { monto: 1_130_000, cantidad: 4 },
    prestamos: { monto: 8_150_000, cantidad: 6 },
  },
  hoyMovimiento: {
    ventas: { monto: 50_000, cantidad: 1 },
    prestamos: { monto: 500_000, cantidad: 1 },
    cobros: { monto: 330_000, cantidad: 2 },
  },
  cobrarHoy: [
    { operacionId: "a", clienteId: "a", clienteNombre: "Marta Lucía Gómez", clienteWhatsapp: "3001234567", origen: "prestamo", monto: 440_000, fecha: new Date("2026-10-03T00:00:00Z"), diasAtraso: 0 },
    { operacionId: "b", clienteId: "b", clienteNombre: "Camila Restrepo", clienteWhatsapp: "3109876543", origen: "venta", monto: 150_000, fecha: new Date("2026-10-03T00:00:00Z"), diasAtraso: 0 },
  ],
  atrasados: [
    { operacionId: "c", clienteId: "c", clienteNombre: "Julián Andrés Ortiz", clienteWhatsapp: "3205550000", origen: "prestamo", monto: 1_100_000, fecha: new Date("2026-09-19T00:00:00Z"), diasAtraso: 14 },
    { operacionId: "d", clienteId: "d", clienteNombre: "Paola Mejía", clienteWhatsapp: "Pendiente", origen: "venta", monto: 90_000, fecha: new Date("2026-09-28T00:00:00Z"), diasAtraso: 5 },
  ],
};

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-end gap-3 border-b border-[color:var(--border)] bg-background/95 px-4 py-2.5 sm:px-7">
          <ThemeToggle />
        </header>
        <main className="min-w-0 flex-1 px-5 py-8 pb-28 sm:px-7 lg:px-10 lg:pb-12">
          <div className="mx-auto w-full max-w-[1180px]">
            <HoyView d={MUESTRA} />
          </div>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
