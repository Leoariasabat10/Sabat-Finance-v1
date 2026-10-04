import { getHoy } from "@/lib/hoy/queries";
import { HoyVista, type Finanzas } from "./_components/hoy";

/**
 * HOY: una sola pregunta, qué tengo que hacer hoy. Lo único que viene del servidor es un resumen de Finance (cuántos
 * cobros hay hoy y cuántos atrasados) para el pilar «Motor económico»; si la base no responde, simplemente no se
 * muestra. Todo lo demás (misión, casillas, medidas) vive en el navegador.
 */
async function resumenFinance(): Promise<Finanzas | null> {
  try {
    const d = await getHoy();
    return { cobrosHoy: d.cobrarHoy.length, atrasados: d.atrasados.length };
  } catch {
    return null;
  }
}

export default async function Page() {
  return <HoyVista finanzas={await resumenFinance()} />;
}
