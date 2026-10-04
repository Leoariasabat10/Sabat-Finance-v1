# Mi Sistema — biblioteca visual (2026-10-04)

Todo el material externo viene de **Pexels** y se rige por la [Pexels License](https://www.pexels.com/license/): uso comercial permitido, sin atribución obligatoria, sin redistribuir el archivo suelto, sin sugerir patrocinio de las personas que aparecen. Licencia verificada en la página de cada asset el 2026-10-04. La autoría se menciona igualmente.

Evaluados y no usados: **Unsplash** (licencia compatible; Pexels cubrió todo el universo), **Mixkit** (sin material de montaña andina ni entrenamiento sobrio), **Adobe Stock, Artlist, Motion Array, Envato Elements** (requieren licencia de pago que la casa no tiene; no se usa nada de ellos).

Dirección: oscuridad, niebla, luz baja, siluetas, manos, montaña. Nada de personas sonriendo en un gimnasio, empresarios con laptop ni frases motivacionales. Tratamiento común: contraste +6 %, saturación −10 % (fotos); contraste +8 %, saturación −14 % y medios tonos cálidos (vídeo). Fotos: WebP ≤1600 px. Vídeos: 10 s, 24 fps, sin audio, 1280×720 (CRF 30) y 540×720 móvil (CRF 32), con póster WebP; ninguno carga hasta acercarse al viewport (`preload="none"`) y todos caen al póster con «reducir movimiento» o ahorro de datos.

Los archivos viven en `public/sistema/foto` y `public/sistema/video`; el registro con rol y texto alternativo está en `src/lib/sistema/media.ts`.

## Vídeos

| Archivo | Pexels | Autoría | Rol | Dónde |
|---|---|---|---|---|
| `alba` | [36026712](https://www.pexels.com/video/majestic-foggy-mountain-aerial-view-at-dawn-36026712/) | Iván Cuadra | MORNING | Hoy · fondo de la misión (antes de las 12:00) |
| `cima` | [16587649](https://www.pexels.com/video/a-mountain-landscape-at-dawn-16587649/) | Geun Goh | CAPITAL | Hoy · fondo de la misión (12:00–18:00) |
| `noche` | [33474906](https://www.pexels.com/video/dramatic-night-sky-with-moon-through-clouds-33474906/) | Ahmet Gurun | NIGHT | Hoy · fondo de la misión (desde las 18:00) |
| `barra` | [36623803](https://www.pexels.com/video/silhouette-of-a-man-doing-pull-ups-in-garage-gym-36623803/) | Jullian Workout | TRAINING | Entrenar · cabecera |
| `camino` | [16600665](https://www.pexels.com/video/a-man-walking-through-a-foggy-forest-with-the-sun-rising-behind-him-16600665/) | Matthias Groeneveld | MOVEMENT | Cuerpo · cabecera |
| `bosque` | [11349552](https://www.pexels.com/video/back-view-of-a-man-walking-in-a-forest-on-a-misty-morning-11349552/) | Matthias Groeneveld | FOCUS | Semanal · cabecera (momento de reflexión) |
| `piedra` | [7830742](https://www.pexels.com/video/close-up-video-of-a-marble-7830742/) | Gabby K | DISCIPLINA | Reglas · cabecera |

El vídeo del Hoy sigue el paso del día (mañana, tarde, noche) según la hora del dispositivo.

## Fotografías

| Archivo | Pexels | Autoría | Rol | Dónde |
|---|---|---|---|---|
| `corredor` | [36039941](https://www.pexels.com/photo/solitary-runner-on-foggy-morning-road-36039941/) | Brunxs | MOVEMENT | Semana · cabecera |
| `hoja` | [13587098](https://www.pexels.com/photo/green-leaf-in-black-background-13587098/) | Marek Kupiec | REST | Comer · cabecera |
| `cumbre` | [32265509](https://www.pexels.com/photo/mesmerizing-sunrise-over-misty-mountain-landscape-32265509/) | Allan Carvalho | ORIGIN | Plan · cabecera |
| `niebla` | [27362175](https://www.pexels.com/photo/a-view-of-the-mountains-and-fog-from-a-dark-sky-27362175/) | Q. Hưng Phạm | ORIGIN | Calendario · cabecera |
| `noche` | [12394051](https://www.pexels.com/photo/street-lights-during-a-rainy-night-12394051/) | Denniz Futalan | NIGHT | Más · cabecera |
| `lectura` | [10680277](https://www.pexels.com/photo/woman-reading-book-in-dark-room-10680277/) | Thingsifind beautiful | REST | Semana · libro de la semana |
| `vendas` | [4460006](https://www.pexels.com/photo/hands-with-red-tapes-4460006/) | Rocco Stoppoloni | DISCIPLINA | Reglas |
| `tiza` | [8729223](https://www.pexels.com/photo/man-clapping-with-powder-on-his-hands-8729223/) | Katya Wolf | TRAINING | Entrenar |
| `dominadas` | [10159989](https://www.pexels.com/photo/silhouette-of-person-on-pull-up-bar-10159989/) | Dmitry Egorov | TRAINING | Entrenar |

## Descartados tras ver la miniatura
Fotos de entrenamiento con modelos sonriendo o ropa deportiva de marca, corredores de maratón con dorsal, estudiantes con laptop, calles de noche con neones saturados, vendas con fondo verde fluorescente, mármoles azules y fluidos de colores. Vídeos: lluvia azul sobre vidrio (saturada, fintech), libro con taza (pastel), luna casi negra (sin información), amanecer plano de nubes (sin forma).
