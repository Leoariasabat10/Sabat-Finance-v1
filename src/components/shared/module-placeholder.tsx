import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { moduleByRoute } from "@/config/modules";

interface ModulePlaceholderProps {
  route: string;
  title: string;
  emoji: string;
}

/**
 * Estado vacío premium para las pantallas cuyo desarrollo corresponde a un
 * módulo posterior del roadmap. El shell es navegable desde el Módulo 1;
 * cada pantalla comunica con claridad en qué etapa se construye.
 */
export function ModulePlaceholder({
  route,
  title,
  emoji,
}: ModulePlaceholderProps) {
  const info = moduleByRoute[route];

  return (
    <div className="animate-fade-up">
      <PageHeader title={title} />
      <EmptyState
        icon={emoji}
        title={`${title} llega en el Módulo ${info?.numero ?? "?"}`}
        description={
          info
            ? `Esta pantalla se construye en el Módulo ${info.numero} — ${info.nombre}. Los fundamentos técnicos (Módulo 1) ya están listos: navegación, sesión, permisos, tema claro/oscuro y diseño base.`
            : "Los fundamentos técnicos ya están listos. Esta pantalla se construye en un módulo posterior del roadmap."
        }
      />
    </div>
  );
}
