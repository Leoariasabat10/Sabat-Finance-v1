import { Button } from "@/components/ui/button";

export function VendidaToggle({ action, vendida }: { action: () => Promise<void>; vendida: boolean }) {
  return (
    <form action={action}>
      <Button type="submit" variant="ghost">
        {vendida ? "Quitar de vendidas" : "Marcar como vendida"}
      </Button>
    </form>
  );
}
