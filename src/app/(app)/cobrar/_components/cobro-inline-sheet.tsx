"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { OrigenIcon } from "@/components/shared/origen-icon";
import { formatearMoneda } from "@/lib/formato";
import { PagoForm } from "@/app/(app)/pagos/_components/pago-form";
import type { CobroItem } from "@/lib/cobrar/queries";

/**
 * Cierra el gap #1 de la auditoría "paga diario": antes, registrar un pago
 * desde Cobrar implicaba navegar a /pagos/nuevo (otra carga de página). Un
 * cobro real en la calle no puede depender de eso — este panel registra el
 * pago sin salir de la lista, prellenado con la cuota del día.
 */
export function CobroInlineSheet({ item }: { item: CobroItem }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <HandCoins className="h-3.5 w-3.5" aria-hidden />
        Cobrar
      </Button>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <OrigenIcon origen={item.origen} />
            {item.clienteNombre}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            {item.clienteWhatsapp}
            {item.diasAtraso > 0 ? <Badge variant="danger">{item.diasAtraso}d de atraso</Badge> : null}
          </SheetDescription>
        </SheetHeader>

        <div className="rounded-md border border-[color:var(--border)] bg-subtle px-3.5 py-3 text-[13px]">
          {item.producto ? <p className="mb-1 text-muted">{item.producto}</p> : null}
          <p className="flex items-baseline justify-between gap-3">
            <span className="text-muted">Cuota de hoy</span>
            <span className="font-mono text-base font-bold tabular-nums">{formatearMoneda(item.saldoCuota)}</span>
          </p>
          {item.saldoOperacion !== item.saldoCuota ? (
            <p className="mt-1 flex items-baseline justify-between gap-3 text-[12px] text-faint">
              <span>Saldo total de la operación</span>
              <span className="font-mono tabular-nums">{formatearMoneda(item.saldoOperacion)}</span>
            </p>
          ) : null}
        </div>

        <PagoForm
          operacionId={item.operacionId}
          saldoPendiente={item.saldoOperacion}
          valorSugerido={item.saldoCuota}
          origen={item.origen}
          onCancel={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
