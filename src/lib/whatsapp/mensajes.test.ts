import { test } from "node:test";
import assert from "node:assert/strict";
import { primerNombre, tieneWhatsapp, construirLinkWhatsapp, mensajeVencido } from "./mensajes";

test("primerNombre usa solo el nombre de pila", () => {
  assert.equal(primerNombre("María Fernanda Pérez"), "María");
  assert.equal(primerNombre("  Juana "), "Juana");
});

test("tieneWhatsapp rechaza 'Pendiente' y números cortos (clientes importados sin número)", () => {
  assert.equal(tieneWhatsapp("Pendiente"), false);
  assert.equal(tieneWhatsapp("12345"), false);
  assert.equal(tieneWhatsapp(null), false);
  assert.equal(tieneWhatsapp("310 554 0222"), true);
  assert.equal(tieneWhatsapp("+57 3105540222"), true);
});

test("el enlace de WhatsApp normaliza a +57 y codifica el mensaje", () => {
  const url = construirLinkWhatsapp("310 554 0222", "Hola María, saldo $150.000");
  assert.ok(url.startsWith("https://wa.me/573105540222?text="));
  assert.ok(url.includes(encodeURIComponent("Hola María")));
});

test("el recordatorio atrasado lleva nombre de pila, valor y la casa", () => {
  const m = mensajeVencido("María Fernanda Pérez", 150000);
  assert.ok(m.startsWith("Hola María,"));
  assert.ok(m.includes("saldo pendiente"));
  assert.ok(m.includes("con SABAT"));
  assert.ok(!m.includes("Fernanda"));
});
