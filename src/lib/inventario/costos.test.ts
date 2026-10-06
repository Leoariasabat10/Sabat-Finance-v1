import test from "node:test";
import assert from "node:assert/strict";
import { asignarCostoLote, costoJoya, costoPorCt, precioMinimo, simularCompra } from "./costos";

test("lote 1.800.000 / 30 ct = 60.000/ct", () => assert.equal(costoPorCt(1_800_000, 30), 60_000));

test("el reparto suma exacto el costo del lote y usa peso real si existe", () => {
  const r = asignarCostoLote(1_800_000, [
    { id: "a", ctEstimado: 8.33 },
    { id: "b", ctEstimado: 10, ctReal: 9.5 },
    { id: "c", ctEstimado: 11.67 },
  ]);
  assert.equal(Object.values(r).reduce((s, v) => s + v, 0), 1_800_000);
  assert.ok(r.c! > r.a!);
});

test("costo de joya conserva el costo de la piedra", () => assert.equal(costoJoya(499_690, [80_000, 30_000, 20_000]), 629_690));

test("precio mínimo con margen 60% = costo / 0,4", () => {
  assert.equal(precioMinimo(400_000, 0.6), 1_000_000);
  assert.throws(() => precioMinimo(1, 1));
});

test("simulador: ejemplos del plan", () => {
  const bueno = simularCompra({ precioPedido: 2_400_000, ctDeclarados: 35, ctEstimados: 32.4, precioMaxCt: 85_000 });
  assert.equal(bueno.declaradoCt, 68_571);
  assert.equal(bueno.efectivoCt, 74_074);
  assert.equal(bueno.veredicto, "atractiva");
  assert.equal(simularCompra({ precioPedido: 3_850_000, ctDeclarados: 35, precioMaxCt: 80_000 }).veredicto, "no_recomendada");
});

import { estimarCt, resumenLote, resumenJoya, simularCompraCompleta } from "./costos";

const piedras = [
  { id: "a", ctEstimado: 8.7 },
  { id: "b", ctEstimado: 3.05 },
  { id: "c", ctEstimado: 21.35 },
];

test("estimarCt calibrado con ESM-001 ≈ 8.7", () => assert.ok(Math.abs(estimarCt(12.4, 13.3, 8) - 8.7) < 0.1));

test("resumenLote: costos suman el lote; ajustado suma el peso real; sin redondeo interno", () => {
  const r = resumenLote({ costoTotal: 1_800_000, ctDeclarados: 30, ctReal: 30 }, piedras);
  assert.ok(Math.abs(r.filas.reduce((s, f) => s + f.costo, 0) - 1_800_000) < 1e-6);
  assert.ok(Math.abs(r.filas.reduce((s, f) => s + f.pesoAjustado, 0) - 30) < 1e-9);
  assert.equal(r.costoPorCtReal, 60_000);
  assert.ok(r.filas.every((f) => Math.abs(f.costoPorCt - 60_000) < 1e-6));
  assert.ok(Math.abs(r.diferenciaEstimadoVsLote - (33.1 - 30)) < 1e-9);
});

test("al pesar una piedra se recalcula todo y el lote sigue cuadrando", () => {
  const r = resumenLote({ costoTotal: 1_800_000, ctDeclarados: 30, ctReal: 30 }, [{ ...piedras[0]!, ctReal: 7.5 }, piedras[1]!, piedras[2]!]);
  assert.equal(r.filas[0]!.pesoAjustado, 7.5);
  assert.equal(r.piedrasSinPesar, 2);
  assert.ok(Math.abs(r.filas.reduce((s, f) => s + f.costo, 0) - 1_800_000) < 1e-6);
  assert.ok(Math.abs(r.filas[0]!.costo - 450_000) < 1e-6);
});

test("resumenJoya: costo, mínimo, margen real y rentabilidad", () => {
  const j = resumenJoya({
    costoPiedra: 500_000,
    costos: [{ concepto: "caja", monto: 80_000 }, { concepto: "cadena", monto: 30_000 }, { concepto: "mano_obra", monto: 90_000 }],
    margenObjetivo: 0.6,
    primaPct: 0.25,
    precioSabat: 2_000_000,
  });
  assert.equal(j.costoTotal, 700_000);
  assert.equal(j.precioMinimo, 1_750_000);
  assert.equal(j.precioRecomendado, 2_187_500);
  assert.equal(j.margenReal, 0.65);
  assert.equal(j.bajoMinimo, false);
  assert.ok(Math.abs((j.rentabilidad as number) - 1_300_000 / 700_000) < 1e-12);
});

test("simulador completo: ajustes de calidad", () => {
  const r = simularCompraCompleta({ precioPedido: 2_400_000, ctDeclarados: 35, precioMaxCt: 85_000, ctEstimados: 32.4, numPiedras: 10 });
  assert.equal(r.efectivoCt, 74_074);
  assert.equal(r.veredicto, "atractiva");
  assert.equal(r.costoPorPiedra, 240_000);
  const malo = simularCompraCompleta({ precioPedido: 2_400_000, ctDeclarados: 35, precioMaxCt: 85_000, ctEstimados: 32.4, ajustes: [-0.15, -0.15] });
  assert.equal(malo.veredicto, "no_recomendada");
});
