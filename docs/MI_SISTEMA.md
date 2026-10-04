# Mi Sistema

El espacio personal de disciplina, dentro de la misma casa y del mismo acceso que SABAT Finance.

```
SABAT Joyería → Iniciar sesión → /login → Administración (/configuracion) → Mi sistema (/sistema)
```

No hay otro login, otra autenticación ni otra aplicación. Es una ruta más de Finance (`src/app/sistema`), fuera del grupo `(app)` a propósito: sin barra lateral ni pestañas de Finance, para que se sienta como un lugar aparte. Siempre en la «bóveda» oscura (`data-theme="dark"` local), sin importar el tema elegido en Finance.

## Qué había y qué hay
- **Antes:** `src/app/(app)/sistema/page.tsx` era un `<iframe>` a `public/sistema/mi-sistema.html` (95 KB de HTML, CSS y JS aparte, con los 39 días del plan, el horario, las rutinas y la lógica). La fuente de verdad era el HTML; el `page.tsx` no tenía lógica.
- **Ahora:** React/TypeScript, sin iframe ni HTML duplicado. Los datos del plan se extrajeron **tal cual** (`src/lib/sistema/plan.ts`: 39 días, 6 rutinas, horario semanal, 10 libros) y el texto de referencia a `src/lib/sistema/contenido.ts`. Las decisiones del plan (horas, clases fijas, series, pasos) no se cambiaron. El HTML se eliminó.

## Pantallas
`Hoy` (principal) · `Semana` · `Entrenar` · `Comer` · `Cuerpo` · `Plan` · `Calendario` · `Reglas` · `Semanal`. En escritorio, las nueve en la cabecera. En teléfono, barra inferior con Hoy, Semana, Entrenar, Comer y **Más** (que lista Cuerpo, Reglas, Semanal, Plan, Calendario y el panel de datos).

- **Hoy:** una misión («la única acción que cambia el día»), un botón «Cumplido», «La verdad de hoy» (Ejecución, Motor económico, Capital personal: una frase humana cada uno, con datos reales y sin números inventados) y «Lo que toca hoy» (las 8 casillas de Cartagena Reset: agua, piel, entrenar, proteína, pasos, agua total, piel, sueño). El pilar «Motor económico» lee de Finance cuántos cobros hay hoy y cuántos atrasados (solo cantidades).
- **Semana:** un día a la vez en teléfono (con «Ahora» marcado), la semana entera en escritorio, y el libro de la semana.
- **Cuerpo:** peso y cintura por semana, con tendencia; el resto de las medidas (entrenos, pasos, sueño, adherencia, notas) se despliegan. Las siete mediciones son las que ya definía el sistema.
- **Semanal:** la revisión de cuatro preguntas por semana del plan.

## Datos: solo en el navegador
`src/lib/sistema/storage.ts`, un único registro `sabat:sistema` en `localStorage`:
- **Por navegador y por dispositivo.** No se sincroniza entre teléfono y computador, no hay copia en la nube y el servidor nunca lo ve. No se promete otra cosa en la interfaz.
- **Versionado** (`version: 2`) y **normalización**: lo que no cumple la forma se descarta, nunca rompe la pantalla.
- **Migración desde la versión anterior:** las claves `cr26:*` (casillas, misión/motor/capital, tabla de progreso) se leen una vez, se convierten y se conservan.
- **Datos corruptos:** si el JSON no se puede leer, se guarda una copia intacta en `sabat:sistema:corrupto:<fecha>` y se empieza limpio, con un aviso.
- **Reset controlado:** «Empezar de cero» pide confirmación y antes deja una copia en `sabat:sistema:copia:<fecha>`. «Exportar» e «Importar» (JSON) sirven para cambiar de dispositivo.
- Si el navegador no deja guardar (lleno o bloqueado) se muestra «No se está guardando».

## Privacidad
Mi Sistema es personal; ser administrador de Finance (quien lleva el negocio) **no** da acceso.
- `esDuenoDelSistema` (`src/lib/auth/acceso.ts`): solo entran los correos de la variable de entorno `SISTEMA_EMAILS` (separados por comas). **Sin la variable, nadie entra** (cerrado por defecto).
- Se comprueba en tres sitios: el middleware (`/sistema/**` redirige a `/configuracion`), el layout del servidor (`redirect`) y el enlace «Mi sistema» de Administración solo se muestra al dueño.
- Cero credenciales en el frontend. El correo sale de la sesión verificada en el servidor (`getUser()`), no de una cookie sin verificar.
- Los vídeos y fotos en `public/sistema` no son datos personales.

## Imágenes y vídeo
`docs/MI_SISTEMA_ASSETS.md` (fuente, autoría, licencia, rol y lugar de cada asset; todo Pexels). Los bucles no cargan hasta acercarse al viewport, tienen póster y versión móvil, y caen al póster con «reducir movimiento» o ahorro de datos.
