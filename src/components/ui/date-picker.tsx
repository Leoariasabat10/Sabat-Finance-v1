"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { cn } from "@/lib/utils";

/**
 * Reemplaza `<input type="date">`: el control nativo se ve distinto en cada
 * navegador/SO (en Windows, con el ícono de calendario gris genérico) —
 * exactamente lo que STYLEGUIDE.md prohíbe ("nada debe parecer panel
 * administrativo"). Value/onChange en formato ISO "YYYY-MM-DD", igual que el
 * input nativo, para que sea un reemplazo directo dentro de react-hook-form
 * vía <Controller>.
 */
const rdpClassNames = {
  months: "flex flex-col",
  month: "space-y-2",
  month_caption: "flex items-center justify-center pt-1 pb-2",
  caption_label: "text-[13px] font-medium capitalize text-foreground",
  nav: "flex items-center justify-between absolute inset-x-1 top-1",
  button_previous:
    "h-7 w-7 inline-flex items-center justify-center rounded-md text-muted transition-colors duration-premium hover:bg-hover-bg hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
  button_next:
    "h-7 w-7 inline-flex items-center justify-center rounded-md text-muted transition-colors duration-premium hover:bg-hover-bg hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
  month_grid: "mt-1 w-full border-collapse",
  weekdays: "flex",
  weekday: "w-8 text-center text-[10px] font-medium uppercase text-faint",
  week: "flex w-full",
  day: "p-0 text-center",
  day_button:
    "h-8 w-8 rounded-md text-[13px] font-semibold text-foreground transition-colors duration-premium hover:bg-hover-bg disabled:pointer-events-none disabled:opacity-30",
  today: "[&_button]:font-medium [&_button]:text-accent",
  selected: "[&_button]:bg-accent [&_button]:text-white [&_button]:hover:bg-accent-dark",
  outside: "[&_button]:text-faint [&_button]:opacity-50",
  disabled: "[&_button]:opacity-30",
  hidden: "invisible",
};

function isoAFecha(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function fechaAIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  className,
  id,
}: {
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const seleccionado = isoAFecha(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center gap-2 border border-[color:var(--border-md)] bg-card px-3 py-2.5 text-left text-sm text-foreground outline-none transition-colors duration-premium ease-premium focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
          {seleccionado
            ? seleccionado.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
            : "Elige una fecha"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <DayPicker
          mode="single"
          selected={seleccionado}
          onSelect={(d) => {
            if (d) {
              onChange(fechaAIso(d));
              setOpen(false);
            }
          }}
          classNames={rdpClassNames}
          showOutsideDays
        />
      </PopoverContent>
    </Popover>
  );
}
