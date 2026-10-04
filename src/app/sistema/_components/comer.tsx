"use client";

import { DIAS, PLAN_FIN, PLAN_INICIO } from "@/lib/sistema/plan";
import { useSistema } from "./store";

const nf = new Intl.NumberFormat("es-CO");

/** La estructura del día de hoy: tres comidas y un snack, con la proteína como regla. Los números quedan abajo, plegados. */
export function ComerHoy() {
  const { listo, hoy } = useSistema();
  const iso = !hoy ? PLAN_INICIO : hoy < PLAN_INICIO ? PLAN_INICIO : hoy > PLAN_FIN ? PLAN_FIN : hoy;
  const d = DIAS.find((x) => x.d === iso) ?? DIAS[0]!;
  const flexible = d.dow === 5 && d.wk <= 5;

  return (
    <section aria-labelledby="toca-comer" className="border-y border-[color:var(--border)] py-6">
      <h2 id="toca-comer" className="text-[14px] font-medium text-faint">
        {listo ? "Hoy toca" : " "}
      </h2>
      <p className="mt-1 font-display text-[34px] leading-[1.05] sm:text-[44px]">Proteína en cada comida.</p>
      {listo ? (
        <ul className="mt-5 grid gap-x-8 sm:grid-cols-2">
          {[
            ["Estructura", "Desayuno, almuerzo, cena y un snack"],
            ["Plato", "Una palma de proteína, un puño de carbohidrato, dos de verdura"],
            ["Proteína", `Al menos ${d.prot} g en el día`],
            ["Energía", `${nf.format(d.kcal)} kcal${flexible ? " · hoy cabe la cena flexible" : ""}`],
          ].map(([k, v]) => (
            <li key={k} className="border-t border-[color:var(--border)] py-3">
              <p className="text-[13px] font-medium text-faint">{k}</p>
              <p className="mt-0.5 text-[17px] leading-snug text-foreground">{v}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
