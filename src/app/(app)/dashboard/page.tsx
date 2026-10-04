import type { Metadata } from "next";
import { getHoy } from "@/lib/hoy/queries";
import { HoyView } from "./_components/hoy-view";

export const metadata: Metadata = { title: "Hoy · Sabat Finance" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return <HoyView d={await getHoy()} />;
}
