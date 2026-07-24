// Pruebas unitarias del motor financiero contra los ejemplos numéricos
// exactos de spec-sistema-prestamos/04-motor-financiero.md.
// Se ejecuta con el test runner nativo de Node (sin dependencias nuevas):
//   npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularInteres } from "./calcularInteres";
import { generarCalendarioCuotas } from "./generarCalendarioCuotas";
import { aplicarPago } from "./aplicarPago";
import { calcularMora } from "./calcularMora";
import { simularRefinanciacion } from "./simularRefinanciacion";
import { simularRenovacion } from "./simularRenovacion";
import { estaPagada } from "./estaPagada";

test("4.2 interés simple mensual, pago único", () => {
  const r = calcularInteres({ montoCapital: 500000, tasaInteres: 0.1, tipoInteres: "mensual", plazoDias: 30 });
  assert.equal(r.interesTotal, 50000);
  assert.equal(r.totalAPagar, 550000);
});

test("4.3 interés diario proporcional (plazo no calza con el mes)", () => {
  const r15 = calcularInteres({ montoCapital: 500000, tasaInteres: 0.1, tipoInteres: "mensual", plazoDias: 15 });
  assert.equal(r15.interesTotal, 25000);
  assert.equal(r15.totalAPagar, 525000);

  const r45 = calcularInteres({ montoCapital: 500000, tasaInteres: 0.1, tipoInteres: "mensual", plazoDias: 45 });
  assert.equal(r45.interesTotal, 75000);
  assert.equal(r45.totalAPagar, 575000);
});

test("4.4 interés semanal + calendario de cuotas", () => {
  const r = calcularInteres({ montoCapital: 500000, tasaInteres: 0.025, tipoInteres: "semanal", plazoDias: 28 });
  assert.equal(r.interesTotal, 50000);

  const cuotas = generarCalendarioCuotas({
    montoCapital: 500000,
    interesTotal: r.interesTotal,
    numeroCuotas: 4,
    fechaOperacion: "2026-01-01",
    diasPorPeriodo: 7,
  });
  assert.equal(cuotas.length, 4);
  assert.equal(cuotas[0]!.capital, 125000);
  assert.equal(cuotas[0]!.interes, 12500);
  assert.equal(cuotas[0]!.total, 137500);
  const sumaTotales = cuotas.reduce((acc, c) => acc + c.total, 0);
  assert.equal(sumaTotales, 550000);
});

test("4.4 interés quincenal", () => {
  const r = calcularInteres({ montoCapital: 1000000, tasaInteres: 0.05, tipoInteres: "quincenal", plazoDias: 30 });
  assert.equal(r.interesTotal, 100000);
  const cuotas = generarCalendarioCuotas({
    montoCapital: 1000000,
    interesTotal: r.interesTotal,
    numeroCuotas: 2,
    fechaOperacion: "2026-01-01",
    diasPorPeriodo: 15,
  });
  assert.equal(cuotas[0]!.total, 550000);
  assert.equal(cuotas[1]!.total, 550000);
});

test("4.5 pago parcial, orden interés primero", () => {
  const pago = aplicarPago({
    interesPendiente: 50000,
    capitalPendiente: 500000,
    montoAbono: 30000,
    tipoAbono: "cuota_completa",
    ordenAplicacionPago: "interes_primero",
  });
  assert.equal(pago.interesPendiente, 20000);
  assert.equal(pago.capitalPendiente, 500000);
  assert.equal(pago.saldoPendiente, 520000);
  assert.equal(pago.pagadoCompleto, false);
});

test("4.5 abono explícito solo a capital", () => {
  const pago = aplicarPago({
    interesPendiente: 0,
    capitalPendiente: 500000,
    montoAbono: 100000,
    tipoAbono: "abono_capital",
    ordenAplicacionPago: "interes_primero",
  });
  assert.equal(pago.capitalPendiente, 400000);
});

test("4.5 abono explícito solo a intereses", () => {
  const pago = aplicarPago({
    interesPendiente: 50000,
    capitalPendiente: 500000,
    montoAbono: 50000,
    tipoAbono: "abono_interes",
    ordenAplicacionPago: "interes_primero",
  });
  assert.equal(pago.interesPendiente, 0);
  assert.equal(pago.capitalPendiente, 500000);
});

test("4.7 mora porcentaje diario y fija", () => {
  assert.equal(
    calcularMora({ valorCuota: 137500, diasAtraso: 5, tipoMora: "porcentaje_diario", tasaMora: 0.01 }),
    6875,
  );
  assert.equal(calcularMora({ valorCuota: 0, diasAtraso: 5, tipoMora: "fijo", tasaMora: 5000 }), 25000);
  assert.equal(calcularMora({ valorCuota: 100000, diasAtraso: 0, tipoMora: "porcentaje_diario", tasaMora: 0.01 }), 0);
});

test("4.8 refinanciación consolida saldo como nuevo capital", () => {
  const refin = simularRefinanciacion({
    saldoPendienteConsolidado: 610000,
    nuevaTasaInteres: 0.1,
    nuevoTipoInteres: "mensual",
    nuevoPlazoDias: 30,
    numeroCuotas: 1,
    fechaOperacion: "2026-01-01",
  });
  assert.equal(refin.montoCapital, 610000);
  assert.equal(refin.interes.interesTotal, 61000);
  assert.equal(refin.cuotas[0]!.total, 671000);
});

test("4.9 renovación: paga interés del período, capital y periodo se extienden", () => {
  const renov = simularRenovacion({
    capitalPendiente: 500000,
    tasaInteres: 0.1,
    tipoInteres: "mensual",
    fechaVencimientoActual: "2026-01-01",
  });
  assert.equal(renov.interesPeriodo, 50000);
  assert.equal(renov.capitalPendiente, 500000);
  assert.equal(renov.nuevaFechaVencimiento, "2026-01-31");
});

test("4.12 venta a crédito sin interés — reparto simple", () => {
  const r = calcularInteres({ montoCapital: 50000, tasaInteres: 0, tipoInteres: "diario", plazoDias: 15 });
  assert.equal(r.interesTotal, 0);
  assert.equal(r.totalAPagar, 50000);

  const cuotas = generarCalendarioCuotas({
    montoCapital: 50000,
    interesTotal: 0,
    numeroCuotas: 2,
    fechaOperacion: "2026-01-01",
    diasPorPeriodo: 8,
  });
  assert.equal(cuotas[0]!.total, 25000);
  assert.equal(cuotas[1]!.total, 25000);
});

test("estaPagada tolera residuo de un centavo por redondeo", () => {
  assert.equal(estaPagada(0), true);
  assert.equal(estaPagada(0.01), true);
  assert.equal(estaPagada(0.02), false);
  assert.equal(estaPagada(150), false);
});

test("aplicarPago proporcional reparte según peso interés/capital", () => {
  const pago = aplicarPago({
    interesPendiente: 50000,
    capitalPendiente: 500000,
    montoAbono: 55000,
    tipoAbono: "cuota_completa",
    ordenAplicacionPago: "proporcional",
  });
  // interés es 50000/550000 = 9.0909...% del saldo total
  assert.equal(pago.aplicadoInteres, 5000);
  assert.equal(pago.aplicadoCapital, 50000);
});
