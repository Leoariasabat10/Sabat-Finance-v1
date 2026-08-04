import { Badge } from "@/components/ui/badge";

export function BadgeEstadoCuota({ estado }: { estado: string }) {
  switch (estado) {
    case "pagada":
      return <Badge variant="success">Pagada</Badge>;
    case "parcial":
      return <Badge variant="warning">Abono parcial</Badge>;
    case "vencida":
      return <Badge variant="danger">Vencida</Badge>;
    default:
      return <Badge variant="info">Pendiente</Badge>;
  }
}
