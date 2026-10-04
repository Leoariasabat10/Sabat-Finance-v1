/**
 * Biblioteca visual de Mi Sistema: cada archivo tiene un rol y un lugar. Fuente, autoría y licencia de cada uno en
 * docs/MI_SISTEMA_ASSETS.md (todo Pexels). La fotografía acompaña; nunca va detrás de lo que hay que hacer.
 */
export type Rol =
  | "DISCIPLINA"
  | "FOCUS"
  | "ORIGIN"
  | "MOVEMENT"
  | "TRAINING"
  | "WORK"
  | "REST"
  | "NIGHT"
  | "MORNING"
  | "CAPITAL"
  | "TRANSFORMATION";

export interface Foto {
  src: string;
  alt: string;
  rol: Rol;
  pos?: string;
}
export interface Clip {
  src: string;
  srcMobile: string;
  poster: string;
  posterMobile: string;
  label: string;
  rol: Rol;
}

const foto = (n: string, alt: string, rol: Rol, pos?: string): Foto => ({ src: `/sistema/foto/${n}.webp`, alt, rol, pos });
const clip = (n: string, label: string, rol: Rol): Clip => ({
  src: `/sistema/video/${n}.mp4`,
  srcMobile: `/sistema/video/${n}-m.mp4`,
  poster: `/sistema/video/${n}-poster.webp`,
  posterMobile: `/sistema/video/${n}-m-poster.webp`,
  label,
  rol,
});

export const FOTOS = {
  dominadas: foto("dominadas", "Silueta sobre una barra de dominadas al atardecer", "TRAINING", "50% 55%"),
  vendas: foto("vendas", "Manos con vendas rojas sobre fondo negro", "DISCIPLINA", "50% 45%"),
  tiza: foto("tiza", "Manos con polvo de tiza", "TRAINING", "50% 40%"),
  corredor: foto("corredor", "Un corredor solitario en una carretera con niebla", "MOVEMENT", "50% 60%"),
  cumbre: foto("cumbre", "Amanecer dorado sobre montañas con niebla", "ORIGIN", "50% 50%"),
  niebla: foto("niebla", "Crestas de montaña entre niebla azul", "ORIGIN", "50% 50%"),
  lectura: foto("lectura", "Una mujer leyendo en una habitación con cortinas", "REST", "50% 50%"),
  noche: foto("noche", "Una calle vacía bajo una farola, de noche", "NIGHT", "50% 50%"),
  hoja: foto("hoja", "Una hoja verde iluminada sobre fondo negro", "REST", "50% 50%"),
} as const;

export const CLIPS = {
  alba: clip("alba", "Niebla sobre un cerro al amanecer", "MORNING"),
  cima: clip("cima", "Sol poniéndose sobre un mar de nubes", "CAPITAL"),
  noche: clip("noche", "Luna entre nubes en la noche", "NIGHT"),
  camino: clip("camino", "Una persona camina entre la niebla hacia el sol", "MOVEMENT"),
  bosque: clip("bosque", "Bosque con niebla y luz de la mañana", "FOCUS"),
  barra: clip("barra", "Silueta entrenando en un cobertizo oscuro", "TRAINING"),
  piedra: clip("piedra", "Veta de mármol oscuro", "DISCIPLINA"),
} as const;
