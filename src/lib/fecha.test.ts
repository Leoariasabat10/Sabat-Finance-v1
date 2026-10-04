import { test } from "node:test";
import assert from "node:assert/strict";
import { hoyIso, hoyFecha, sumarDias, inicioDeMes, diasEntreFechas } from "./fecha";

test("a las 8 p. m. en Bogotá (01:00 UTC del día siguiente) sigue siendo el día de Bogotá", () => {
  // 2026-10-03 20:00 en Bogotá = 2026-10-04 01:00 UTC
  assert.equal(hoyIso(new Date("2026-10-04T01:00:00Z")), "2026-10-03");
});

test("a las 11:59 p. m. en Bogotá todavía es el mismo día; a medianoche cambia", () => {
  assert.equal(hoyIso(new Date("2026-10-04T04:59:00Z")), "2026-10-03");
  assert.equal(hoyIso(new Date("2026-10-04T05:00:00Z")), "2026-10-04");
});

test("hoyFecha devuelve medianoche UTC del día de Bogotá (comparable con @db.Date)", () => {
  assert.equal(hoyFecha(new Date("2026-10-04T01:00:00Z")).toISOString(), "2026-10-03T00:00:00.000Z");
});

test("sumarDias y diasEntreFechas son aritmética de fecha pura", () => {
  const a = new Date("2026-10-03T00:00:00Z");
  assert.equal(sumarDias(a, 7).toISOString().slice(0, 10), "2026-10-10");
  assert.equal(diasEntreFechas(a, new Date("2026-10-10T00:00:00Z")), 7);
  assert.equal(diasEntreFechas(new Date("2026-10-10T00:00:00Z"), a), -7);
});

test("inicioDeMes ancla el día 1 en UTC", () => {
  assert.equal(inicioDeMes(new Date("2026-10-17T00:00:00Z")).toISOString(), "2026-10-01T00:00:00.000Z");
});
