import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "Monza — Diseñador de productos",
  description:
    "Diseñador de productos que crea interfaces claras y sistemáticas. Portfolio y biblioteca de componentes de UI.",
};

export default function SpanishHome() {
  return <LandingPage locale="es" />;
}
