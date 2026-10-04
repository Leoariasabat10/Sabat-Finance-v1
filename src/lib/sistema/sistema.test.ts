import test from "node:test";
import assert from "node:assert/strict";
import { CLAVE, datosVacios, escribir, exportar, importar, leer, migrarV1, normalizar, type Almacen } from "./storage";
import { aNumero, calcularPilares, lecturaEjecucion, sumarDias, tendencia } from "./calculos";

function almacen(init: Record<string, string> = {}): Almacen & { m: Map<string, string> } {
  const m = new Map(Object.entries(init));
  return {
    m,
    get length() {
      return m.size;
    },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
  };
}

test("almacén vacío → datos vacíos, estado nuevo", () => {
  const r = leer(almacen());
  assert.equal(r.estado, "nuevo");
  assert.deepEqual(r.datos, datosVacios());
});

test("guardar y leer vuelve igual", () => {
  const a = almacen();
  const d = datosVacios();
  d.dias["2026-10-05"] = { mision: "Vender 2 piezas", hecha: true, checks: [true, false, false, false, false, false, false, false] };
  assert.ok(escribir(a, d));
  const r = leer(a);
  assert.equal(r.estado, "ok");
  assert.equal(r.datos.dias["2026-10-05"]?.mision, "Vender 2 piezas");
});

test("JSON corrupto: se conserva copia y se empieza limpio", () => {
  const a = almacen({ [CLAVE]: "{no es json" });
  const r = leer(a);
  assert.equal(r.estado, "corrupto");
  assert.ok([...a.m.keys()].some((k) => k.startsWith(`${CLAVE}:corrupto:`)));
  assert.equal(a.m.get(CLAVE), "{no es json", "no se pisa el original");
});

test("normalizar descarta basura sin lanzar", () => {
  const d = normalizar({ dias: { "2026-10-05": { mision: 5, hecha: "sí", checks: "x" }, malo: { mision: "x" } }, medidas: { "9": { peso: "1" }, "0": { peso: "78" } }, revisiones: null });
  assert.deepEqual(d.dias, {});
  assert.deepEqual(d.medidas, { "0": { peso: "78" } });
  assert.deepEqual(normalizar("texto"), datosVacios());
  assert.deepEqual(normalizar(null), datosVacios());
});

test("migra la versión anterior (claves cr26:*) sin borrarlas", () => {
  const a = almacen({
    "cr26:2026-10-05": JSON.stringify([true, false, true, false, false, false, false, false]),
    "cr26:sys:2026-10-05": JSON.stringify({ mision: "Cerrar proveedor", done: true, motor: "escribí a 3 proveedores" }),
    "cr26:prog": JSON.stringify({ "0-0": "78", "0-1": "86", "1-0": "77,5" }),
  });
  const r = leer(a);
  assert.equal(r.estado, "migrado");
  assert.equal(r.datos.dias["2026-10-05"]?.hecha, true);
  assert.equal(r.datos.dias["2026-10-05"]?.mision, "Cerrar proveedor");
  assert.equal(r.datos.dias["2026-10-05"]?.checks?.[2], true);
  assert.deepEqual(r.datos.medidas["0"], { peso: "78", cintura: "86" });
  assert.equal(r.datos.medidas["1"]?.peso, "77,5");
  assert.ok(a.m.has("cr26:prog"), "los datos viejos se conservan");
  assert.equal(migrarV1(almacen()), null);
});

test("exportar → importar es reversible; texto inválido → null", () => {
  const d = datosVacios();
  d.revisiones["1"] = { hice: "todo" };
  assert.deepEqual(importar(exportar(d))?.revisiones, { "1": { hice: "todo" } });
  assert.equal(importar("nada"), null);
  assert.equal(importar("[]"), null);
});

test("racha: cuenta días seguidos y, si hoy falta, desde ayer", () => {
  const d = datosVacios();
  for (const iso of ["2026-10-05", "2026-10-06", "2026-10-07"]) d.dias[iso] = { hecha: true };
  assert.equal(calcularPilares(d, "2026-10-07").racha, 3);
  assert.equal(calcularPilares(d, "2026-10-08").racha, 3, "hoy sin marcar: la racha sigue viva desde ayer");
  assert.equal(calcularPilares(d, "2026-10-09").racha, 0, "dos días sin cumplir la rompen");
});

test("sin registros no se inventa nada", () => {
  const p = calcularPilares(datosVacios(), "2026-10-05");
  assert.equal(p.hayRegistros, false);
  assert.equal(p.sinMotor, 0);
  assert.equal(lecturaEjecucion(p, false, 8).tono, "alerta");
});

test("motor y capital: cuentan solo días con texto", () => {
  const d = datosVacios();
  d.dias["2026-10-05"] = { motor: "vendí", cap1: " " };
  d.dias["2026-10-06"] = { motor: "  ", cap2: "escribí a Juan" };
  const p = calcularPilares(d, "2026-10-07");
  assert.equal(p.motor7, 1);
  assert.equal(p.capital7, 1);
});

test("fechas y medidas", () => {
  assert.equal(sumarDias("2026-10-31", 1), "2026-11-01");
  assert.equal(aNumero("76,5"), 76.5);
  assert.equal(aNumero("  "), null);
  assert.equal(aNumero(undefined), null);
  assert.equal(tendencia([{ fila: "0", valor: 86 }, { fila: "3", valor: 84.5 }]), -1.5);
  assert.equal(tendencia([{ fila: "0", valor: 86 }]), null);
});
