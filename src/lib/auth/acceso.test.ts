import { test } from "node:test";
import assert from "node:assert/strict";
import { esAdministrador, destinoSeguro } from "../auth/acceso";

test("sin usuario no hay acceso", () => {
  assert.equal(esAdministrador(null, "a@b.com"), false);
});

test("una cuenta registrada por cualquiera (sin rol ni correo autorizado) NO entra", () => {
  assert.equal(esAdministrador({ email: "intruso@correo.com", app_metadata: { provider: "email" } }, "dueno@sabat.co"), false);
});

test("entra con app_metadata.rol = admin", () => {
  assert.equal(esAdministrador({ email: "x@y.com", app_metadata: { rol: "admin" } }, ""), true);
});

test("entra si su correo está en ADMIN_EMAILS (sin distinguir mayúsculas ni espacios)", () => {
  assert.equal(esAdministrador({ email: "Dueno@Sabat.co" }, "otro@x.com, dueno@sabat.co"), true);
});

test("ADMIN_EMAILS vacío no autoriza a nadie", () => {
  assert.equal(esAdministrador({ email: "a@b.com" }, ""), false);
});

test("destinoSeguro solo acepta rutas internas", () => {
  assert.equal(destinoSeguro("/clientes"), "/clientes");
  assert.equal(destinoSeguro("/cobrar?x=1"), "/cobrar?x=1");
  assert.equal(destinoSeguro("//sitio-malo.com"), "/dashboard");
  assert.equal(destinoSeguro("https://sitio-malo.com"), "/dashboard");
  assert.equal(destinoSeguro("/\\sitio-malo.com"), "/dashboard");
  assert.equal(destinoSeguro(null), "/dashboard");
});
