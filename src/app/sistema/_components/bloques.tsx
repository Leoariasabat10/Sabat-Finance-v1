import type { ReactNode } from "react";
import type { Bloque, Tarjeta } from "@/lib/sistema/contenido";

/** "**negrita**" → <strong>. El contenido de referencia usa solo este marcado. */
export function Rico({ x }: { x: string }) {
  return (
    <>
      {x.split("**").map((t, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-medium text-foreground">
            {t}
          </strong>
        ) : (
          t.split("\n").map((l, j) => (
            <span key={`${i}-${j}`}>
              {j > 0 ? <br /> : null}
              {l}
            </span>
          ))
        ),
      )}
    </>
  );
}

/** Despliegue nativo (<details>): sin JavaScript, con teclado y lector de pantalla gratis. */
export function Plegable({ titulo, abierto = false, children }: { titulo: string; abierto?: boolean; children: ReactNode }) {
  return (
    <details open={abierto} className="group border-t border-[color:var(--border)]">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
        <h3 className="text-[22px] leading-tight sm:text-[24px]">{titulo}</h3>
        <span aria-hidden className="relative h-4 w-4 shrink-0 text-accent transition-transform duration-200 ease-premium group-open:rotate-45">
          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
        </span>
      </summary>
      <div className="flex flex-col gap-5 pb-8">{children}</div>
    </details>
  );
}

function Tabla({ head, filas }: { head: string[] | null; filas: string[][] }) {
  return (
    <>
      {/* teléfono: cada fila es un bloque, la primera celda es el título */}
      <dl className="md:hidden">
        {filas.map((f, i) => (
          <div key={i} className="border-t border-[color:var(--border)] py-3 first:border-t-0">
            <dt className="text-[15px] font-medium text-foreground">
              <Rico x={f[0] ?? ""} />
            </dt>
            {f.slice(1).map((c, j) => (
              <dd key={j} className="mt-1 text-[15px] leading-relaxed text-muted">
                {head && head[j + 1] ? <span className="text-faint">{head[j + 1]}: </span> : null}
                <Rico x={c} />
              </dd>
            ))}
          </div>
        ))}
      </dl>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-[15px]">
          {head ? (
            <thead>
              <tr>
                {head.map((h, i) => (
                  <th key={i} className="border-b border-[color:var(--border-md)] px-3 py-2.5 text-[13px] font-medium text-faint first:pl-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {filas.map((f, i) => (
              <tr key={i} className="align-top">
                {f.map((c, j) => (
                  <td key={j} className={`border-b border-[color:var(--border)] px-3 py-3 leading-relaxed first:pl-0 ${j === 0 ? "w-[22%] font-medium text-foreground" : "text-muted"}`}>
                    <Rico x={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Tarjetas({ items }: { items: Tarjeta[] }) {
  const cols = items.length >= 4 ? "lg:grid-cols-4 sm:grid-cols-2" : items.length === 3 ? "md:grid-cols-3" : items.length === 2 ? "md:grid-cols-2" : "";
  return (
    <div className={`grid grid-cols-1 gap-x-8 ${cols}`}>
      {items.map((c, i) => (
        <div key={i} className="border-t border-[color:var(--border)] py-4">
          <p className="text-[13px] font-medium text-faint">{c.lab}</p>
          {c.val ? <p className="mt-1 text-[19px] leading-snug text-foreground">{c.val}</p> : null}
          {c.sub ? (
            <p className="mt-1 text-[15px] leading-relaxed text-muted">
              <Rico x={c.sub} />
            </p>
          ) : null}
          {c.p ? (
            <p className="mt-2 text-[16px] leading-relaxed text-muted">
              <Rico x={c.p} />
            </p>
          ) : null}
          {c.lis ? (
            <ul className="mt-2 flex flex-col gap-1.5 text-[15px] leading-relaxed text-muted">
              {c.lis.map((l, j) => (
                <li key={j} className="flex gap-2.5">
                  <span aria-hidden className="mt-[0.7em] h-px w-2.5 shrink-0 bg-[color:var(--border-md)]" />
                  <span>
                    <Rico x={l} />
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function Bloque1({ b }: { b: Bloque }) {
  switch (b.t) {
    case "nota":
      return (
        <p className="max-w-[62ch] text-[15px] leading-relaxed text-muted">
          <Rico x={b.x} />
        </p>
      );
    case "aviso":
      return (
        <p className="max-w-[68ch] border-l border-[color:var(--gold)] py-1 pl-4 text-[15px] leading-relaxed text-muted">
          <Rico x={b.x} />
        </p>
      );
    case "tabla":
      return <Tabla head={b.head} filas={b.filas} />;
    case "tarjetas":
      return <Tarjetas items={b.items} />;
    case "lista":
      return (
        <ul className="flex max-w-[68ch] flex-col gap-2 text-[16px] leading-relaxed text-muted">
          {b.items.map((l, j) => (
            <li key={j} className="flex gap-2.5">
              <span aria-hidden className="mt-[0.75em] h-px w-2.5 shrink-0 bg-[color:var(--border-md)]" />
              <span>
                <Rico x={l} />
              </span>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

/**
 * Pinta los bloques de una página de referencia. Cada `h3` abre un apartado plegable; lo que va antes del primer `h3`
 * se muestra abierto. `omitir` quita apartados enteros por título; `abiertos` los deja desplegados.
 */
export function Bloques({ bloques, omitir = [], abiertos = [] }: { bloques: Bloque[]; omitir?: string[]; abiertos?: string[] }) {
  const grupos: { titulo: string | null; items: Bloque[] }[] = [{ titulo: null, items: [] }];
  for (const b of bloques) {
    if (b.t === "h2" || b.t === "lead") continue;
    if (b.t === "h3") grupos.push({ titulo: b.x, items: [] });
    else grupos[grupos.length - 1]!.items.push(b);
  }
  return (
    <div className="flex flex-col">
      {grupos.map((g, i) => {
        if (g.titulo && omitir.includes(g.titulo)) return null;
        if (g.items.length === 0 && !g.titulo) return null;
        const cuerpo = g.items.map((b, k) => <Bloque1 key={k} b={b} />);
        return g.titulo ? (
          <Plegable key={i} titulo={g.titulo} abierto={abiertos.includes(g.titulo)}>
            {cuerpo}
          </Plegable>
        ) : (
          <div key={i} className="flex flex-col gap-5 pb-8">
            {cuerpo}
          </div>
        );
      })}
      <div className="border-t border-[color:var(--border)]" />
    </div>
  );
}
