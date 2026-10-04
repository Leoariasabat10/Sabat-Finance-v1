"use client";

import { useEffect, useRef, useState } from "react";
import type { Clip } from "@/lib/sistema/media";

/**
 * Bucle silencioso que no cuesta nada hasta que se ve:
 * - el póster (primer fotograma real) está desde el primer byte de HTML y es todo el resultado si el vídeo no puede
 *   o no debe reproducirse (movimiento reducido, ahorro de datos, bajo consumo, red caída);
 * - `preload="none"`: ni un byte de vídeo hasta acercarse al viewport; versión móvil (540×720) o de escritorio en JS;
 * - `muted` como propiedad del DOM + `playsInline`; un toque reintenta si el navegador lo rechaza;
 * - solo se reproduce mientras es visible y la pestaña está activa.
 */
export function LoopVideo({
  clip,
  className = "",
  objectClassName = "object-cover",
}: {
  clip: Clip;
  className?: string;
  objectClassName?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduce || saver) return;

    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("webkit-playsinline", "");
    const url = window.matchMedia("(max-width: 767px)").matches ? clip.srcMobile : clip.src;

    let visible = false;
    const start = () => {
      if (!visible || document.hidden) return;
      if (v.getAttribute("src") !== url) v.src = url;
      v.play().catch(() => {
        /* rechazado: queda el póster y un toque lo reintenta */
      });
    };
    const onPlaying = () => setPlaying(true);
    const onVisibility = () => (document.hidden ? v.pause() : start());
    v.addEventListener("playing", onPlaying);
    window.addEventListener("pointerdown", start, { once: true, passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        visible = entry.isIntersecting;
        if (visible) start();
        else v.pause();
      },
      { rootMargin: "120px" },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("playing", onPlaying);
      window.removeEventListener("pointerdown", start);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [clip.src, clip.srcMobile]);

  return (
    <div role="img" aria-label={clip.label} className={`relative overflow-hidden bg-[#0a0a0a] ${className}`}>
      {/* eslint-disable @next/next/no-img-element -- fotogramas decorativos ya dimensionados */}
      <img src={clip.posterMobile} alt="" decoding="async" className={`absolute inset-0 h-full w-full md:hidden ${objectClassName}`} />
      <img src={clip.poster} alt="" decoding="async" className={`absolute inset-0 hidden h-full w-full md:block ${objectClassName}`} />
      {/* eslint-enable @next/next/no-img-element */}
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        disablePictureInPicture
        tabIndex={-1}
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-out ${objectClassName} ${playing ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
