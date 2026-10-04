/**
 * Contenido de referencia de Mi Sistema (plan, entrenar, comer, cuerpo, reglas, semanal). Generado una vez a partir de
 * la versión anterior en HTML (ya eliminada) sin retocar las decisiones del plan; a partir de aquí ESTE archivo es la
 * fuente de verdad y se edita a mano.  "**texto**" marca negrita.
 */
export interface Tarjeta {
  lab: string;
  val?: string;
  sub?: string;
  p?: string;
  lis?: string[];
}
export type Bloque =
  | { t: "h2" | "h3" | "lead" | "nota" | "aviso"; x: string }
  | { t: "tabla"; head: string[] | null; filas: string[][] }
  | { t: "lista"; items: string[] }
  | { t: "tarjetas"; items: Tarjeta[] };

export type Pagina = "plan" | "entrenar" | "comer" | "cuerpo" | "reglas" | "semanal" | "semana";
export const CONTENIDO: Record<Pagina, Bloque[]> = {
 "plan": [
  {
   "t": "h2",
   "x": "Plan general"
  },
  {
   "t": "lead",
   "x": "Un plan operativo de 5 semanas. Cinco palancas, ordenadas por impacto. Todo lo demás es ruido."
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "1 · Fuerza",
     "val": "4 sesiones por semana, en casa",
     "sub": "45 min con peso corporal, mancuerna de 18 lb y banda. Protege el músculo mientras bajas grasa."
    },
    {
     "lab": "2 · Pasos",
     "val": "7.000 → 10.000 al día",
     "sub": "Sube cada semana. Es el gasto extra más fácil de sostener."
    },
    {
     "lab": "3 · Comida",
     "val": "≈ 2.200 kcal · proteína ≥ 150 g",
     "sub": "Déficit moderado (~14 %). Sin hambre, sin pesar cada gramo."
    },
    {
     "lab": "4 · Sueño",
     "val": "7–8 horas",
     "sub": "Regula hambre, recuperación e hinchazón."
    },
    {
     "lab": "5 · Piel",
     "val": "3 pasos, conservador",
     "sub": "El adapaleno tarda 8–12 semanas en mostrar resultado real. Aquí se empieza bien, no se apura."
    }
   ]
  },
  {
   "t": "h3",
   "x": "Tiempo exacto"
  },
  {
   "t": "tabla",
   "head": null,
   "filas": [
    [
     "Duración del plan",
     "39 días (5 oct → 12 nov, ambos incluidos) = 5 semanas completas + 4 días"
    ],
    [
     "Desde hoy, 4 oct",
     "Faltan 39 días para el 12 nov. Mañana (5 oct, lunes) es el Día 1; el 12 nov (jueves) es el Día 39."
    ],
    [
     "Sesiones de fuerza",
     "21 (incluye 1 sesión ligera en semana Cartagena y 4 de descarga)"
    ],
    [
     "Caminata / core corto / descanso activo",
     "16 días"
    ],
    [
     "Descanso total o viaje",
     "2 días"
    ]
   ]
  },
  {
   "t": "h3",
   "x": "Fases"
  },
  {
   "t": "tabla",
   "head": [
    "Fase",
    "Fechas",
    "Enfoque",
    "Series",
    "Pasos",
    "kcal"
   ],
   "filas": [
    [
     "1 · Adaptación",
     "5–11 oct",
     "Aprender técnica, crear rutina. Piel: empezar suave.",
     "2–3 · 3-4 RIR",
     "7.000",
     "2.300"
    ],
    [
     "2 · Construcción",
     "12–25 oct",
     "Acumular repeticiones y tempo. Es donde más músculo se protege.",
     "3–4 · 2 RIR",
     "8.000 → 9.000",
     "2.200"
    ],
    [
     "3 · Definición",
     "26 oct–1 nov",
     "Semana pico: más series, pausas, menos descanso.",
     "4 · 1-2 RIR",
     "10.000",
     "2.200"
    ],
    [
     "4 · Descarga",
     "2–8 nov",
     "Mismo peso, la mitad del volumen. Llegas fresco.",
     "2 · 4 RIR",
     "9.000",
     "2.300"
    ],
    [
     "5 · Cartagena",
     "9–12 nov",
     "Dormir, moverse suave, comer normal, alcohol 0.",
     "2 · ligero",
     "8.000",
     "≈ 2.600"
    ]
   ]
  },
  {
   "t": "nota",
   "x": "Se modificó el ejemplo inicial: cuatro semanas de carga y una de descarga antes del viaje es lo que mejor protege el rendimiento y el ánimo cuando hay déficit. RIR = repeticiones que te quedan en reserva."
  },
  {
   "t": "h3",
   "x": "Qué esperar (realista, no prometido)"
  },
  {
   "t": "tabla",
   "head": null,
   "filas": [
    [
     "Peso",
     "≈ 76–77,5 kg hacia el 8 nov. Referencia, no meta. Puede variar ±1 kg por agua de un día a otro."
    ],
    [
     "Cintura",
     "−2 a −4 cm es posible si cumples ≥ 80 % del plan."
    ],
    [
     "Hinchazón",
     "Es lo que más mejora en 2–3 semanas: sueño, alcohol, sodio, fibra, caminar."
    ],
    [
     "Fuerza",
     "Más repeticiones en todos los ejercicios. Esto es lo más seguro de todo."
    ],
    [
     "Abdomen marcado",
     "No garantizado. Depende del porcentaje de grasa actual, que no conocemos."
    ],
    [
     "Piel",
     "Mejora parcial posible. El resultado completo del adapaleno llega después del viaje."
    ]
   ]
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "Antes de empezar",
     "p": "78 kg a 1,85 m es un IMC de ≈ 22,8: rango saludable. Por eso el foco no es “bajar de peso” sino composición y hábitos, y por eso medimos cintura y fotos antes que la báscula. Si sentirte gordo se vuelve un pensamiento constante, afecta tu ánimo o tu forma de comer, vale la pena hablarlo con un psicólogo. No es señal de que algo esté mal contigo; es parte de llegar mejor."
    }
   ]
  },
  {
   "t": "h3",
   "x": "Semana de Cartagena · 9–12 nov"
  },
  {
   "t": "tabla",
   "head": [
    "Fecha",
    "Entrenamiento",
    "Comida y hábitos"
   ],
   "filas": [
    [
     "Lun 9",
     "Cuerpo completo ligero, 2 series, 30 min",
     "≈ 2.600 kcal, normal. Alcohol 0. Último adapaleno antes del viaje."
    ],
    [
     "Mar 10",
     "Caminata 40 min suave + core corto",
     "Sin ultraprocesados ni comida muy salada. Sal normal en casa, sin extras."
    ],
    [
     "Mié 11",
     "Descanso + 10 min de movilidad",
     "Hidratación constante, fibra, cena temprana. Maleta lista. Duerme 8 h."
    ],
    [
     "Jue 12",
     "Viaje: camina normal",
     "Come normal, toma agua, protector solar puesto. Llegas con energía."
    ]
   ]
  },
  {
   "t": "lista",
   "items": [
    "Sueño 8 h, sin pantallas 45 min antes.",
    "Nada nuevo: ni comidas, ni productos de piel, ni suplementos.",
    "Sin exfoliante esta semana. Protector solar todos los días, también en la playa.",
    "Agua 2,5–3 L repartida. Orina amarillo pálido es la señal."
   ]
  },
  {
   "t": "aviso",
   "x": "**No hacer:** deshidratarte, saltarte comidas, cardio extremo, diuréticos, sauna, suplementos nuevos. Ninguno “desinfla”; todos te dejan peor el día del viaje."
  },
  {
   "t": "h3",
   "x": "Auditoría del coach"
  },
  {
   "t": "tabla",
   "head": [
    "Riesgo revisado",
    "Decisión"
   ],
   "filas": [
    [
     "Déficit excesivo",
     "Moderado: ≈ 350–400 kcal (~14 %). Piso 2.000 kcal. Si bajas más de 0,7 kg/sem dos semanas seguidas, subes 150–200 kcal."
    ],
    [
     "Exceso de entrenamiento",
     "4 sesiones de fuerza, no 6. Sin doble sesión. Semana 5 de descarga. Martes y viernes (5 a.m.) son días cortos."
    ],
    [
     "Mancuerna de 18 lb muy ligera",
     "Progresión por tempo, pausas, ejercicios a una pierna/brazo y mochila con libros. Nunca al fallo."
    ],
    [
     "Pasos absurdos",
     "Rampa 7.000 → 10.000. Mínimo 6.000 en un día malo."
    ],
    [
     "Adapaleno + exfoliante",
     "Nunca la misma noche ni en noches seguidas. Exfoliante opcional y pausado desde el 1 nov."
    ],
    [
     "Productos sin datos",
     "No se asumió concentración ni ingredientes. Lee la etiqueta; si el adapaleno te lo recetaron, manda la indicación médica."
    ],
    [
     "“Definirme” vs. no obsesionarme",
     "Se pesa 1 vez por semana, fotos 1 vez por semana, y la cintura es el indicador principal."
    ],
    [
     "Peligros pre-viaje",
     "Descartados: deshidratación, ayuno, diuréticos, cardio extremo."
    ]
   ]
  },
  {
   "t": "aviso",
   "x": "**Información que falta y que podría cambiar el plan:** porcentaje de grasa real; lesiones o molestias (rodillas, muñecas, hombros); condiciones médicas o medicación; antecedentes con la comida (atracones o restricción); intolerancias; pasos reales de hoy (mira 3 días en la app Salud); concentración del adapaleno. Las calorías son una estimación con margen de ± 200 kcal; se calibran en la semana 2. Este documento es orientativo y no reemplaza a un médico, nutricionista o dermatólogo."
  }
 ],
 "entrenar": [
  {
   "t": "h2",
   "x": "Entrenar en casa"
  },
  {
   "t": "lead",
   "x": "Peso corporal, mancuerna de 18 lb y banda. Con poca carga, la progresión viene de repeticiones, tempo, pausas y variantes más difíciles."
  },
  {
   "t": "h3",
   "x": "Semana a semana"
  },
  {
   "t": "tabla",
   "head": [
    "Semana",
    "Series",
    "Esfuerzo",
    "Cómo progresar"
   ],
   "filas": [
    [
     "1 · 5–11 oct",
     "2–3",
     "3–4 RIR",
     "Aprender técnica. Sin buscar el límite."
    ],
    [
     "2 · 12–18 oct",
     "3",
     "2–3 RIR",
     "Llega al tope del rango de repeticiones."
    ],
    [
     "3 · 19–25 oct",
     "3–4",
     "2 RIR",
     "Tempo 3-1-1 (3 s bajando, 1 s pausa, 1 s subiendo) en los ejercicios principales."
    ],
    [
     "4 · 26 oct–1 nov",
     "4 en los 2 principales",
     "1–2 RIR",
     "Pausas de 2 s, variantes más difíciles. Nunca fallo técnico."
    ],
    [
     "5 · 2–8 nov",
     "2",
     "4 RIR",
     "Mismos pesos y variantes de la semana 4, la mitad del volumen."
    ],
    [
     "6 · 9–12 nov",
     "2",
     "ligero",
     "Una sola sesión corta. Llegar fresco."
    ]
   ]
  },
  {
   "t": "nota",
   "x": "**Regla de progresión doble:** cuando completas el tope del rango en todas las series con técnica limpia, subes la dificultad (variante, tempo, pausa, mochila con libros) y vuelves al piso del rango. RIR 2 = paras con 2 repeticiones que aún podrías hacer."
  },
  {
   "t": "nota",
   "x": "**Calentamiento (5 min):** marcha en el sitio 1 min · 10 círculos de brazos · 10 sentadillas sin peso · 10 puentes de glúteo · 5 flexiones fáciles. **Final:** 3 min de estiramiento suave."
  },
  {
   "t": "aviso",
   "x": "**Para si hay dolor agudo** en muñeca, hombro, rodilla o lumbar. Incomodidad muscular está bien; dolor articular punzante, no. Cambia a la variante más fácil."
  },
  {
   "t": "h3",
   "x": "Rutinas"
  },
  {
   "t": "h3",
   "x": "Pasos y cardio"
  },
  {
   "t": "tabla",
   "head": [
    "Semana",
    "Pasos / día",
    "Tiempo total caminando",
    "Caminata dedicada"
   ],
   "filas": [
    [
     "1",
     "7.000",
     "≈ 70 min",
     "15–30 min"
    ],
    [
     "2",
     "8.000",
     "≈ 80 min",
     "20–40 min"
    ],
    [
     "3",
     "9.000",
     "≈ 90 min",
     "20–40 min"
    ],
    [
     "4",
     "10.000",
     "≈ 100 min",
     "20–40 min"
    ],
    [
     "5",
     "9.000",
     "≈ 90 min",
     "20–30 min suave"
    ],
    [
     "Cartagena",
     "8.000",
     "≈ 80 min",
     "20–40 min suave"
    ]
   ]
  },
  {
   "t": "lista",
   "items": [
    "**Caminata ligera:** puedes hablar con normalidad. Después de comer, 10–15 min.",
    "**Caminata rápida:** puedes hablar en frases cortas, no cantar. Viernes largo.",
    "**Cardio:** solo intervalos suaves los viernes de las semanas 3 y 4: 6 × 1 min rápido / 1 min suave. No hay más cardio intenso.",
    "**Descanso:** domingo y miércoles de Cartagena. Pasos normales, nada más.",
    "Una caminata dedicada de 30–40 min suma ≈ 3.500–4.500 pasos. El resto sale de moverte: el trayecto a la universidad cuenta."
   ]
  }
 ],
 "comer": [
  {
   "t": "h2",
   "x": "Comer"
  },
  {
   "t": "lead",
   "x": "Barato, colombiano, sin suplementos y sin dieta de culturista. La regla es simple: proteína en cada comida y plato con verdura."
  },
  {
   "t": "h3",
   "x": "Los números"
  },
  {
   "t": "tabla",
   "head": null,
   "filas": [
    [
     "Metabolismo basal (Mifflin-St Jeor)",
     "10 × 78 + 6,25 × 185 − 5 × 22 + 5 ≈ 1.830 kcal"
    ],
    [
     "Mantenimiento estimado",
     "≈ 2.450–2.750 kcal (factor 1,35–1,5: estudiante que camina y entrena 4 veces por semana). Central ≈ 2.600."
    ],
    [
     "Objetivo",
     "≈ 2.200 kcal (rango 2.100–2.300). Déficit ≈ 350–400 kcal, ~14 %. Nunca por debajo de 2.000."
    ],
    [
     "Proteína",
     "≥ 150 g (≈ 1,9 g/kg). Reparte 30–40 g en cada comida principal."
    ],
    [
     "Grasa y carbohidrato",
     "Grasa ≈ 65–75 g. Carbohidrato: el resto (≈ 230–260 g), sobre todo alrededor del entrenamiento."
    ],
    [
     "Fibra",
     "≥ 25 g: fruta entera, verdura, lenteja, fríjol, avena."
    ],
    [
     "Por semana",
     "S1 2.300 · S2–S4 2.200 · S5 2.300 · Cartagena ≈ 2.600"
    ]
   ]
  },
  {
   "t": "nota",
   "x": "Faltan datos para afinar: composición corporal y actividad real. Por eso hay rango. Calibración en la semana 2: si la cintura y la tendencia de peso no se mueven con ≥ 80 % de adherencia, bajas ~100 kcal o subes 1.000 pasos, no ambos."
  },
  {
   "t": "h3",
   "x": "Cómo armar el plato"
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "Proteína",
     "val": "1 palma",
     "sub": "≈ 150 g cocidos de pollo, carne magra o pescado; o 3 huevos."
    },
    {
     "lab": "Carbohidrato",
     "val": "1 puño",
     "sub": "≈ 150 g cocidos de arroz o papa; ¾ de taza de lentejas o fríjoles."
    },
    {
     "lab": "Verdura",
     "val": "2 puños",
     "sub": "Ensalada o cocida. Sin límite real."
    },
    {
     "lab": "Grasa",
     "val": "1 cucharadita",
     "sub": "Aceite al cocinar. Aguacate: ¼ a ½ al día."
    }
   ]
  },
  {
   "t": "h3",
   "x": "Lista de alimentos"
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "Base · todos los días",
     "lis": [
      "Huevos",
      "Pechuga y muslo de pollo sin piel",
      "Carne magra (posta, molida magra)",
      "Pescado: mojarra, tilapia; atún en agua",
      "Lentejas, fríjoles, garbanzos",
      "Arroz, papa, plátano",
      "Avena",
      "Leche y yogur natural sin azúcar",
      "Fruta: banano, manzana, mandarina, guayaba, papaya",
      "Verduras: tomate, cebolla, zanahoria, lechuga, pepino, repollo",
      "Maní (20 g), aguacate (¼–½)"
     ]
    },
    {
     "lab": "Limitar",
     "lis": [
      "Gaseosas, jugos de caja, té con azúcar",
      "Fritos: empanadas, chicharrón, papa frita",
      "Embutidos: salchicha, chorizo",
      "Papas de paquete, galletas, dulces",
      "Caldos en cubo y sopas instantáneas",
      "Pastelería y pan dulce",
      "Salsas azucaradas",
      "Alcohol (ver reglas abajo)"
     ]
    },
    {
     "lab": "Ocasional · sin culpa",
     "lis": [
      "Pizza: 2 porciones + ensalada",
      "Hamburguesa, mejor hecha en casa",
      "1 empanada o 1 arepa con queso",
      "Helado, 1 porción",
      "Bandeja paisa compartida, sin chicharrón extra",
      "Chocolate oscuro",
      "1–2 cervezas o tragos en un evento"
     ]
    }
   ]
  },
  {
   "t": "nota",
   "x": "No asumimos que te gusta todo. Si no te gusta una base (por ejemplo, lentejas), cámbiala por otra de su grupo: fríjoles, garbanzos o más papa/arroz con otra proteína."
  },
  {
   "t": "h3",
   "x": "Ejemplos con cantidades aproximadas"
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "Desayuno",
     "lis": [
      "3 huevos revueltos con tomate y cebolla + 1 arepa mediana (90 g) + 1 banano + tinto sin azúcar · ≈ 520 kcal · 24 g P",
      "Avena 50 g cocida en 250 ml de leche + 1 banano + 2 huevos duros · ≈ 520 kcal · 30 g P",
      "Calentado: ¾ taza de fríjoles + ½ taza de arroz + 2 huevos + ensalada · ≈ 550 kcal · 26 g P",
      "2 panes con 40 g de queso fresco + 2 huevos + fruta · ≈ 520 kcal · 28 g P"
     ]
    },
    {
     "lab": "Almuerzo",
     "lis": [
      "Pechuga a la plancha 170 g + ¾ taza de arroz + ½ taza de lentejas + ensalada grande + 1 cdta de aceite · ≈ 660 kcal · 55 g P",
      "Carne magra desmechada 150 g + 200 g de papa cocida + ½ taza de fríjoles + ensalada · ≈ 680 kcal · 50 g P",
      "Mojarra o tilapia al horno 200 g + ¾ taza de arroz + ensalada + ¼ de plátano maduro · ≈ 620 kcal · 48 g P",
      "Sancocho: 1 plato con 1 presa, 1 papa, 1 trozo pequeño de yuca · ≈ 650 kcal · 40 g P"
     ]
    },
    {
     "lab": "Cena",
     "lis": [
      "Tortilla de 3 huevos con verduras + 1 arepa pequeña o 150 g de papa + ensalada · ≈ 480 kcal · 25 g P",
      "1 lata de atún + 1 papa mediana + ensalada + ½ aguacate · ≈ 480 kcal · 28 g P",
      "Pollo desmechado 130 g + ½ taza de arroz + verduras salteadas · ≈ 500 kcal · 38 g P",
      "1,5 tazas de sopa de lentejas + 1 huevo + ½ arepa · ≈ 500 kcal · 28 g P"
     ]
    },
    {
     "lab": "Snacks · 1 o 2 al día",
     "lis": [
      "Yogur natural 200 g + 1 fruta · ≈ 200 kcal · 8 g P",
      "2 huevos duros + 1 mandarina · ≈ 220 kcal · 13 g P",
      "1 vaso de leche + 1 banano · ≈ 200 kcal · 7 g P",
      "20 g de maní + 1 manzana · ≈ 200 kcal · 5 g P",
      "Queso fresco 40 g + 1 arepa mini · ≈ 220 kcal · 10 g P"
     ]
    }
   ]
  },
  {
   "t": "nota",
   "x": "Un día típico suma ≈ 2.100 kcal y ≈ 140 g de proteína. Para llegar a tu objetivo del día ajusta el arroz o la papa en ± 50–100 g. Los valores son aproximados."
  },
  {
   "t": "h3",
   "x": "Comida colombiana, sin dieta rara"
  },
  {
   "t": "tabla",
   "head": [
    "Alimento",
    "Cómo manejarlo"
   ],
   "filas": [
    [
     "Arroz",
     "¾ de taza cocida (≈ 150 g) como base. No se prohíbe. Si el plato ya trae papa o plátano, baja el arroz a la mitad."
    ],
    [
     "Papa",
     "Cocida o al horno. Es muy saciante. Fría solo en la cena flexible."
    ],
    [
     "Arepa",
     "1 mediana (90 g) por comida como carbohidrato, sin mantequilla ni doble queso."
    ],
    [
     "Huevos",
     "2–4 al día está bien. Revueltos o duros, poco aceite."
    ],
    [
     "Pollo",
     "Sin piel, a la plancha, cocido o desmechado. Pollo asado: quita la piel."
    ],
    [
     "Carne",
     "Magra: posta, bota, molida magra. Evita chicharrón, costilla y cortes grasos a diario."
    ],
    [
     "Fríjoles y lentejas",
     "½–¾ de taza: cuentan como carbohidrato y como proteína. Cocinados sin chicharrón ni tocino."
    ],
    [
     "Frutas",
     "2–3 porciones al día, enteras. El jugo no sustituye a la fruta."
    ],
    [
     "Fuera de casa",
     "Corrientazo: proteína primero, dejar la mitad del arroz, pedir “doble ensalada”, jugo sin azúcar o agua. Pizza: 2 porciones + ensalada. Calle: evita el frito, elige asado o cocido."
    ]
   ]
  },
  {
   "t": "h3",
   "x": "Compras de la semana · una persona"
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "Proteínas",
     "lis": [
      "Huevos: 30",
      "Pechuga de pollo: 1,5–2 kg",
      "Carne magra: 1 kg",
      "Atún en agua: 4 latas",
      "Pescado: 500 g (opcional)",
      "Leche: 1,5 L",
      "Yogur natural: 1 kg",
      "Queso fresco: 250 g"
     ]
    },
    {
     "lab": "Carbohidratos",
     "lis": [
      "Arroz: 1 kg (dura ~2 semanas)",
      "Papa: 2 kg",
      "Lentejas o fríjoles: 500 g",
      "Avena: 500 g",
      "Arepas: 14",
      "Plátano: 3–4"
     ]
    },
    {
     "lab": "Fruta, verdura, grasa",
     "lis": [
      "Banano: 14",
      "Manzana: 7",
      "Mandarinas: 1 kg",
      "Tomate, cebolla, zanahoria: 1 kg de cada uno",
      "Lechuga o espinaca, pepino, repollo",
      "Aguacate: 3",
      "Maní: 200 g",
      "Aceite, limón, sal, café"
     ]
    }
   ]
  },
  {
   "t": "nota",
   "x": "Opcional y gratis: una mochila con libros te sirve como peso extra en sentadillas y remos."
  },
  {
   "t": "h3",
   "x": "Qué limitar y por qué"
  },
  {
   "t": "tabla",
   "head": [
    "Si consumes…",
    "Puede afectar…",
    "Qué hacer"
   ],
   "filas": [
    [
     "Alcohol",
     "~7 kcal/g sin saciar; fragmenta el sueño; aumenta el apetito de la noche y el día siguiente; retiene líquido; baja la recuperación.",
     "Lunes a jueves: 0. Evento social: ver regla abajo."
    ],
    [
     "Bebidas azucaradas",
     "150–300 kcal líquidas que no quitan el hambre.",
     "Agua, tinto sin azúcar, agua con limón."
    ],
    [
     "Ultraprocesados",
     "Fáciles de comer de más; poca proteína; mucho sodio y azúcar.",
     "Máximo 1 porción pequeña al día, no como comida."
    ],
    [
     "Fritos",
     "200–400 kcal de aceite escondidas; digestión pesada; hinchazón.",
     "Solo en la cena flexible del sábado."
    ],
    [
     "Mucho sodio (embutidos, caldos en cubo)",
     "Retención de líquido que se nota en la cara y el abdomen por 24–48 h.",
     "Cocina con sal medida. No hay que eliminarla."
    ],
    [
     "Atracones y comer por ansiedad",
     "Exceso de calorías en 30 min; culpa que lleva a compensar con hambre.",
     "Ver “¿Qué hago si tengo ansiedad por comer?”."
    ],
    [
     "Cafeína tarde",
     "Empeora el sueño, y el sueño regula el hambre.",
     "Último café a las 14:00."
    ]
   ]
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "Regla para eventos sociales",
     "p": "**1 plato central, máximo 2 tragos, agua entre cada uno.** Come normal antes de ir; llegar con hambre empeora todo. Proteína primero. Al día siguiente: desayuno normal, agua, caminata y plan de siempre. Sin ayuno de compensación."
    }
   ]
  }
 ],
 "cuerpo": [
  {
   "t": "h2",
   "x": "Cuerpo"
  },
  {
   "t": "lead",
   "x": "Agua, sueño, piel y hinchazón. Pocas reglas, hechas todos los días."
  },
  {
   "t": "h3",
   "x": "Hidratación"
  },
  {
   "t": "tabla",
   "head": [
    "Momento",
    "Cantidad",
    "Cómo"
   ],
   "filas": [
    [
     "Mañana",
     "600 ml",
     "400 ml al despertar + 200 ml con el desayuno"
    ],
    [
     "Mediodía",
     "700 ml",
     "Botella de 750 ml entre desayuno y almuerzo"
    ],
    [
     "Tarde",
     "700 ml",
     "Botella de 750 ml entre almuerzo y cena"
    ],
    [
     "Noche",
     "500 ml",
     "Último vaso 1 hora antes de dormir"
    ]
   ]
  },
  {
   "t": "nota",
   "x": "Total ≈ 2,5 L = 3 botellas de 750 ml + 1 vaso. Suma 500 ml los días de entrenamiento. La señal es la orina amarillo pálido; no hay que forzar más."
  },
  {
   "t": "h3",
   "x": "Sueño · 7–9 horas"
  },
  {
   "t": "tabla",
   "head": [
    "Noche",
    "Pantallas fuera",
    "Luces apagadas",
    "Despertar"
   ],
   "filas": [
    [
     "Domingo",
     "21:45",
     "22:30",
     "6:00 (lunes)"
    ],
    [
     "Lunes",
     "21:15",
     "22:00",
     "5:00 (martes, clase)"
    ],
    [
     "Martes",
     "21:45",
     "22:30",
     "6:00"
    ],
    [
     "Miércoles",
     "21:45",
     "22:30",
     "6:00"
    ],
    [
     "Jueves",
     "21:15",
     "22:00",
     "5:00 (viernes, clase)"
    ],
    [
     "Viernes",
     "22:15",
     "23:00",
     "7:00"
    ],
    [
     "Sábado",
     "22:15",
     "23:00",
     "7:00"
    ]
   ]
  },
  {
   "t": "lista",
   "items": [
    "**Teléfono:** carga lejos de la cama. Alarma, nada más.",
    "**Cafeína:** último café a las 14:00.",
    "**Alcohol:** te duerme más rápido pero rompe el sueño profundo. En noches de 5 a.m., no.",
    "Los martes y viernes de clase a las 7 a.m. duermes ≈ 7 h: si te levantas cansado, adelanta 15 min."
   ]
  },
  {
   "t": "tabla",
   "head": null,
   "filas": [
    [
     "Hambre",
     "Dormir poco sube el apetito y los antojos de carbohidrato al día siguiente."
    ],
    [
     "Recuperación",
     "El músculo se repara durante el sueño profundo."
    ],
    [
     "Entrenamiento",
     "Con poco sueño baja la fuerza y la técnica; sube el riesgo de molestias."
    ],
    [
     "Apariencia",
     "Cara más hinchada, ojeras, piel peor."
    ],
    [
     "Rendimiento",
     "Concentración y ánimo, tanto para estudiar como para Sabat."
    ]
   ]
  },
  {
   "t": "h3",
   "x": "Piel · rutina conservadora"
  },
  {
   "t": "aviso",
   "x": "**Qué no sabemos:** la concentración de tu adapaleno y los ingredientes del suero exfoliante. No se asumen. Lee las etiquetas: si el exfoliante es ácido (glicólico, salicílico, láctico), se comporta como se describe aquí. Si el adapaleno te lo recetaron, la indicación médica manda sobre esta tabla."
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "Mañana · todos los días",
     "lis": [
      "1. Limpiar suave (o solo agua si la piel está sensible)",
      "2. Hidratante sin fragancia, no comedogénico",
      "3. Protector solar SPF 30–50, ≈ 2 dedos para cara y cuello. Repite si estás afuera más de 2 h."
     ]
    },
    {
     "lab": "Noche",
     "lis": [
      "1. Limpiar suave y secar. Espera 15–30 min.",
      "2. **Lunes y jueves:** adapaleno, cantidad de una arveja para toda la cara. Evita ojos, labios y comisuras de la nariz.",
      "3. Hidratante. Si hay ardor, ponlo antes del adapaleno.",
      "Otras noches: solo limpiar e hidratar."
     ]
    }
   ]
  },
  {
   "t": "tabla",
   "head": null,
   "filas": [
    [
     "Exfoliante",
     "Las primeras 2 semanas, no. Opcional los sábados 24 y 31 oct, solo si tu piel está tranquila. Nunca la misma noche del adapaleno ni en noches seguidas. Desde el 1 nov, pausado; nada en la semana del viaje."
    ],
    [
     "Evitar irritación",
     "Agua tibia, sin esponjas ni scrubs, sin tocarte los granos. Si hay descamación o ardor, 3 noches sin adapaleno y solo hidratar. Cuando mejore, vuelves a empezar."
    ],
    [
     "Protector solar",
     "Imprescindible: el adapaleno hace la piel más sensible al sol. En Bogotá la radiación UV es alta aunque esté nublado."
    ],
    [
     "Después de entrenar",
     "Lava sudor de cara, pecho y espalda. Camiseta limpia."
    ],
    [
     "“No Sweat”",
     "Es solo para axilas. No va en la cara. Úsalo según las instrucciones de su etiqueta, sobre piel limpia y seca, y no sobre piel irritada o recién afeitada."
    ],
    [
     "Esperanza realista",
     "El adapaleno puede brotar un poco al inicio. Mejoría clara: 8–12 semanas. Al 12 nov, mejor piel, no piel perfecta."
    ]
   ]
  },
  {
   "t": "aviso",
   "x": "**Consulta a dermatología si hay:** acné severo; nódulos o quistes; cicatrices; irritación intensa; quemaduras en la piel; empeoramiento importante."
  },
  {
   "t": "h3",
   "x": "Cómo verte menos hinchado, sin hacer estupideces"
  },
  {
   "t": "tabla",
   "head": [
    "",
    "Pérdida de grasa",
    "Agua e hinchazón"
   ],
   "filas": [
    [
     "Velocidad",
     "Lenta: 0,3–0,5 kg por semana",
     "Rápida: 1–2 kg en 24–48 h"
    ],
    [
     "Causa",
     "Déficit sostenido",
     "Sodio, alcohol, poco sueño, estrés, estreñimiento, comida abundante"
    ],
    [
     "Cómo se ve",
     "Cintura baja, tendencia de 2–3 semanas",
     "Sube y baja de un día para otro"
    ],
    [
     "Qué hacer",
     "Plan completo, semana tras semana",
     "Sueño, agua, fibra, caminar. No corregir con ayunos."
    ]
   ]
  },
  {
   "t": "tabla",
   "head": null,
   "filas": [
    [
     "Sueño",
     "≥ 7 h baja la retención y la cara se ve más descansada."
    ],
    [
     "Alcohol",
     "Cada noche sin alcohol baja la retención del día siguiente."
    ],
    [
     "Sodio",
     "Ultraprocesados y caldos en cubo son la fuente más grande. Sal medida en casa está bien."
    ],
    [
     "Hidratación",
     "Constante. Beber poco no deshincha, aumenta la retención."
    ],
    [
     "Actividad",
     "Caminar todos los días mueve líquidos y tránsito."
    ],
    [
     "Digestión",
     "Fibra (fruta, verdura, lentejas, avena) + agua + caminata. Un tránsito regular cambia el abdomen."
    ],
    [
     "Estrés",
     "5 min de respiración lenta o caminata. Estrés alto también sube apetito y retención."
    ]
   ]
  },
  {
   "t": "aviso",
   "x": "**No deshidratarte antes del viaje.** Tampoco laxantes, diuréticos, sauna ni quitar toda la sal. Si la hinchazón abdominal es constante, dolorosa o con cambios intestinales, consulta a un médico: puede ser una intolerancia, no grasa."
  }
 ],
 "reglas": [
  {
   "t": "h2",
   "x": "Reglas para fallar sin abandonar"
  },
  {
   "t": "lead",
   "x": "Fallar un día no es el problema. El problema es lo que haces después."
  },
  {
   "t": "aviso",
   "x": "**Siempre:** no compensar con hambre · no hacer doble entrenamiento · no castigarse. Vuelves al plan en la siguiente decisión."
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "¿Qué hago si fallo un día?",
     "p": "Nada especial. Mañana, el plan de mañana. Un día fallido no cambia el resultado de 39 días. Si estás mal de ánimo o con poca energía, haz el **día mínimo**: 10 min de las 2 primeras series, 6.000 pasos, proteína en 3 comidas y cama a hora."
    },
    {
     "lab": "¿Qué hago si como demasiado?",
     "p": "La siguiente comida es la del plan, no menos. Agua y 15–20 min de caminata. No te peses ese día ni al siguiente. Una comida grande son unos cientos de calorías; el hambre de compensación te cuesta más."
    },
    {
     "lab": "¿Qué hago si no entrené?",
     "p": "Haces la siguiente sesión, no ambas. Si se te escapan 2 o más sesiones seguidas, repites la carga de la semana anterior. No recuperas sesiones en el domingo."
    },
    {
     "lab": "¿Qué hago si bebí alcohol?",
     "p": "Agua, desayuno con proteína, caminata y dormir 8 h. No sauna ni cardio extra “para quemarlo”. El peso puede subir 1 kg por agua; es temporal. Ignóralo."
    },
    {
     "lab": "¿Qué hago si tengo ansiedad por comer?",
     "p": "1) Toma un vaso de agua y espera 10 min. 2) Pregúntate: ¿hambre física o emocional? 3) Física: merienda planeada (proteína + fruta). 4) Emocional: caminata de 10 min o ducha. 5) Si aun así comes, sirve en un plato, sentado, sin pantalla. Si los atracones son frecuentes, háblalo con un profesional."
    }
   ]
  },
  {
   "t": "h3",
   "x": "Psicología · reglas, no frases"
  },
  {
   "t": "tabla",
   "head": null,
   "filas": [
    [
     "1",
     "Una comida no define el día. Un día no define la semana. Vuelves a ejecutar la siguiente decisión correcta."
    ],
    [
     "2",
     "El día mínimo cuenta como día cumplido. Cumplir poco es mejor que no cumplir."
    ],
    [
     "3",
     "Se mide una vez por semana. Los domingos. Entre domingos, no hay datos que valga la pena revisar."
    ],
    [
     "4",
     "Si piensas “ya dañé la dieta”, haz esto: bebe agua, camina 10 min, y la siguiente comida es la del plan."
    ],
    [
     "5",
     "Escala de hambre 1–10: empieza a comer en 3–4, para en 6–7. Si no sabes qué sientes, espera 10 min."
    ],
    [
     "6",
     "Regla si–entonces: si es la 3 p. m. y tengo antojo, entonces me como la merienda planeada. Se decide antes, no durante."
    ],
    [
     "7",
     "Espejo y fotos: solo el domingo. El resto de la semana, nada de revisarte en busca de defectos."
    ]
   ]
  }
 ],
 "semanal": [
  {
   "t": "h2",
   "x": "Check-in semanal"
  },
  {
   "t": "lead",
   "x": "Una vez por semana, los domingos por la mañana. No pesarse a diario: el peso cambia por agua, sodio, comida y sueño sin que haya cambiado la grasa."
  },
  {
   "t": "tabla",
   "head": null,
   "filas": [
    [
     "Peso",
     "Al despertar, después de ir al baño, antes de comer, misma báscula."
    ],
    [
     "Cintura",
     "A la altura del ombligo, exhalando, cinta sin apretar."
    ],
    [
     "Fotos",
     "Frente, lado y espalda. Misma luz, misma ropa, misma distancia."
    ],
    [
     "Pasos promedio",
     "Del promedio de la semana en tu app de salud."
    ],
    [
     "Entrenamientos",
     "Cuántos de los 4 completaste."
    ],
    [
     "Adherencia",
     "% de comidas dentro del plan (aproximado)."
    ],
    [
     "Sueño",
     "Horas promedio."
    ],
    [
     "Estado general",
     "1–5: energía, ánimo, hambre."
    ]
   ]
  },
  {
   "t": "h3",
   "x": "Tabla de progreso"
  },
  {
   "t": "nota",
   "x": "Se guarda en este navegador. Si abres el archivo desde otro dispositivo, empieza vacía."
  },
  {
   "t": "h3",
   "x": "Cómo ajustar, solo con datos"
  },
  {
   "t": "tabla",
   "head": null,
   "filas": [
    [
     "Bajas > 0,7 kg/sem dos semanas seguidas o hay mala energía",
     "Sube 150–200 kcal (arroz o papa)."
    ],
    [
     "Sin cambios en cintura ni peso en 2 semanas, con ≥ 80 % de adherencia",
     "Baja ~100 kcal o sube 1.000 pasos. Una cosa a la vez. Nunca por debajo de 2.000 kcal."
    ],
    [
     "Sueño < 6,5 h en promedio",
     "Antes de tocar la comida, arregla el sueño."
    ],
    [
     "Irritación en la piel",
     "3 noches sin adapaleno, solo hidratar."
    ]
   ]
  }
 ],
 "semana": [
  {
   "t": "h2",
   "x": "Semana"
  },
  {
   "t": "lead",
   "x": "Tus clases no se mueven. Todo lo demás se acomoda alrededor. Hoy aparece enmarcado."
  },
  {
   "t": "tarjetas",
   "items": [
    {
     "lab": "Libro de esta semana",
     "val": "",
     "sub": "Rota solo, una vez por semana. No hay que decidir. 15 minutos al día."
    }
   ]
  },
  {
   "t": "aviso",
   "x": "**Ajustes frente a la versión anterior en Excel:** el gimnasio se reemplazó por el entrenamiento en casa del plan Cartagena, y las horas de despertar y de dormir siguen la tabla de sueño (5:00 martes y viernes por clase; 6:00 lunes, miércoles y jueves; 7:00 sábado y domingo)."
  }
 ]
};
