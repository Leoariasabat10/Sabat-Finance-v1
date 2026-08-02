"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Reutiliza los tokens de motion de STYLEGUIDE.md (duration-premium /
 * ease-premium) en vez de inventar tiempos nuevos — mismos valores que
 * tailwind.config.ts usa para las transiciones CSS del resto de la app.
 */
const EASE_PREMIUM = [0.4, 0, 0.2, 1] as const;
const DURATION_PREMIUM = 0.18;

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Entrada de tarjeta/sección: fade + translate-y sutil, nunca instantánea ni brusca. */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={fadeUpVariants}
      transition={{ duration: DURATION_PREMIUM * 1.8, ease: EASE_PREMIUM, delay }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

/** Contenedor de lista: anima sus StaggerItem hijos en cascada. */
export function StaggerList({ children, className, staggerDelay = 0.04 }: StaggerListProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerDelay } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={fadeUpVariants}
      transition={{ duration: DURATION_PREMIUM * 1.8, ease: EASE_PREMIUM }}
    >
      {children}
    </motion.div>
  );
}
