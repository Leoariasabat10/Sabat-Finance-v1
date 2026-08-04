import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Landmark } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getPrestamoById } from "@/lib/prestamos/queries";
import { EditarPrestamoForm } from "../../_components/editar-prestamo-form";

export const metadata: Metadata = { title: "Editar préstamo · Sabat Finance" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const operacion = await getPrestamoById(id);
  if (!operacion) notFound();

  // Misma regla que editarPrestamo en el servidor (auditoría Sprint 1,
  // punto #2): si ya hay pagos o el préstamo no está activo, no tiene
  // sentido mostrar un formulario editable.
  if (operacion.pagos.length > 0 || operacion.estado !== "activo") {
    notFound();
  }

  return (
    <div className="animate-fade-up flex flex-col gap-5">
      <PageHeader
        title={`Editar préstamo de ${operacion.cliente.nombre}`}
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5 text-accent" aria-hidden /> Financiero
          </span>
        }
      />
      <EditarPrestamoForm
        prestamoId={operacion.id}
        valoresIniciales={{
          montoCapital: Number(operacion.montoCapital),
          tasaInteres: Number(operacion.tasaInteres) * 100,
          tipoInteres: operacion.tipoInteres,
          diasBasePersonalizado: undefined,
          plazoDias: operacion.plazoDias,
          formaPago: operacion.formaPago,
          fechaOperacion: operacion.fechaOperacion.toISOString().slice(0, 10),
        }}
      />
    </div>
  );
}
