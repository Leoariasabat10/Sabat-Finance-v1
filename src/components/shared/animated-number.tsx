"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { formatearMoneda } from "@/lib/formato";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/** Cifra que cuenta hacia el nuevo valor en vez de saltar de golpe. */
export function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  duration = 0.6,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const reduce = useReducedMotion();
  const prevValue = useRef(value);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      prevValue.current = value;
      return;
    }
    const controls = animate(prevValue.current, value, {
      duration,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: setDisplay,
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <span className={className}>{format(display)}</span>;
}

export function AnimatedMoneda({ valor, className }: { valor: number; className?: string }) {
  return <AnimatedNumber value={valor} format={formatearMoneda} className={className} />;
}
