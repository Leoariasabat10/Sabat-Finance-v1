# Auditoría y rediseño de Sabat Finance (octubre 2026)

## Qué estaba mal
| # | Hallazgo | Gravedad | Estado |
|---|---|---|---|
| 1 | La base de datos de Finance (`muejylrvaeyqpodkfhyk`) ya no existe: producción daba `tenant/user not found` y el middleware agotaba 25 s | Crítica | Datos recuperados del respaldo del 14 ago en el esquema `finance` del proyecto `sabat-joyeria` (16 clientes, 18 créditos, 19 cuotas, 6 pagos, 2 ventas, 24 movimientos de caja). La auditoría histórica (183 registros, casi toda de pruebas QA) no se cargó; el respaldo sigue en `Desktop/union sabat fiannce`. |
| 2 | Acceso: bastaba tener *cualquier* sesión. Con Supabase Auth compartido y registro abierto, cualquiera con la clave pública podía registrarse y ver clientes y deudas | Crítica | Middleware exige administrador (`app_metadata.rol = admin` o `ADMIN_EMAILS`) |
| 3 | `?next=//sitio.com` pasaba el filtro de redirección | Alta | `destinoSeguro()` |
| 4 | Si Supabase no responde, el middleware se colgaba | Alta | Espera máxima de 4 s y aviso en `/login` |
| 5 | "Hoy" usaba la fecha UTC: desde las 7 p. m. en Colombia ya era "mañana" (ventas, pagos, cobros y mora cambiaban de día antes de tiempo) | Alta | `lib/fecha.ts` (hora de Bogotá), 15 puntos corregidos |
| 6 | El saldo de caja se encadenaba desde el último movimiento y `capital_inicial = 0`: "Dinero disponible" mostraría −1.725.000; además dos pagos simultáneos desordenaban la cadena | Alta | Saldo = dinero inicial + entradas − salidas |
| 7 | Doble toque = pago, venta o préstamo duplicados | Alta | Bloqueo de fila (`FOR UPDATE`) y guarda de 20 s |
| 8 | Elegir un cliente sugerido no enviaba su `id`; el servidor buscaba por WhatsApp. 15 de 16 clientes tienen "Pendiente": la venta caía en otro cliente, y el formulario rechazaba "Pendiente" | Alta | El formulario envía `clienteId`; el WhatsApp solo se exige a clientes nuevos |
| 9 | `similarity()` (búsqueda difusa) no existe en el esquema nuevo | Media | `extensions.similarity()` |
| 10 | RLS: no existía en la base anterior | Alta | Esquema `finance` con RLS activado en las 18 tablas y sin permisos para `anon`/`authenticated`; solo el servidor (rol `postgres`) accede |

## Pendiente que no se puede resolver con código
- Poner la cadena de conexión (con contraseña) de `sabat-joyeria` en Vercel y en `.env.local`.
- Crear el usuario administrador en Supabase Auth y desactivar el registro abierto (Authentication → Sign In / Providers → *Allow new users to sign up* en OFF).
- Registrar en Administración con cuánto dinero empezó el negocio (hoy `capital_inicial = 0`).
- 15 clientes importados tienen WhatsApp "Pendiente": completar el número en cada ficha para habilitar el botón de WhatsApp.
