import type { StaticImageData } from "next/image";
import atiend from "@/public/atiend.png";
import atiendCalls from "@/public/atiendcalls.png";
import atp from "@/public/atp.png";
import centroCortinas from "@/public/centrocortinas.png";
import gecko from "@/public/gecko.png";
import habitat from "@/public/habitat.png";
import hariaz from "@/public/hariaz.png";
import mazzo from "@/public/mazzo.png";
import derk from "@/public/derk.png";
import weekly from "@/public/weekly.png";
import metro from "@/public/metro.png";
import myOutfit from "@/public/myoutfit.png";
import type { Locale } from "@/lib/i18n";

/**
 * The horizontal Work rail, in the order it scrolls past.
 *
 * The shots are imported rather than pointed at by path: that hands over each
 * file's real pixel dimensions, which is what lets the rail give every card the
 * same height and take whatever width the image's own ratio asks for. Nothing
 * is cropped, so a shot of any shape is safe to add — a tall one just makes a
 * narrow card.
 *
 * `tag` is the small label printed opposite the title. Keep it to two words.
 */
export type WorkItem = {
  slug: string;
  title: string;
  tag: string;
  description: string;
  image: StaticImageData;
};

export const WORK: WorkItem[] = [
  {
    slug: "atiend-calls",
    title: "Atiend Calls",
    tag: "Product site",
    description:
      "Led the end-to-end product development of Atiend Calls, from AI infrastructure and telephony integrations to UX/UI and design system.",
    image: atiendCalls,
  },
  {
    slug: "atiend",
    title: "Atiend",
    tag: "Product site",
    description:
      "Built an AI-powered messaging dashboard integrated with Meta’s official WhatsApp API, including automated quote generation based on custom pricing formulas.Developed product catalog management and ERP integrations to connect conversations, pricing, and operational data.",
    image: atiend,
  },

  {
    slug: "derk",
    title: "Derk",
    tag: "Studio site",
    description:
      "Designed and built an AI-powered website widget centered around a conversational input experience, along with the complete management dashboard.",
    image: derk,
  },
  {
    slug: "mazzo",
    title: "Mazzo Developments",
    tag: "Studio site",
    description:
      "Delivered custom software solutions for clients through, typically combining internal admin panels with user-facing web applications.",
    image: mazzo,
  },
  {
    slug: "metropolitana",
    title: "Metropolitana Seguros",
    tag: "Studio site",
    description:
      "Built a complete insurance website with a custom design system, SEO-focused architecture, and polished user experience. Developed an API-powered auto insurance quoting flow to generate real-time policy estimates directly from the website.",
    image: metro,
  },
  {
    slug: "weekly",
    title: "Weekly",
    tag: "Product site",
    description:
      "React Native mobile app for creating and organizing photo grid dumps through a simple, visual-first experience.",
    image: weekly,
  },

  {
    slug: "habitat",
    title: "Habitat Conecta",
    tag: "Web app",
    description:
      "Networking platform connecting entrepreneurs and businesses, supported by a feature-rich administrative dashboard.",
    image: habitat,
  },
  {
    slug: "atp",
    title: "ATP",
    tag: "Dashboard",
    description:
      "Transformed the company’s Excel-based workflow into a centralized import and export quoting dashboard with the full business logic built into the product. Designed the UX/UI and developed employee-focused components to streamline daily operations and reduce manual processes.",
    image: atp,
  },

  {
    slug: "gecko",
    title: "Gecko",
    tag: "Product site",
    description:
      "Performed QA and software testing for Gecko, a comprehensive clinical management platform used across critical healthcare workflows.",
    image: gecko,
  },

  {
    slug: "myoutfit",
    title: "My Outfit",
    tag: "Web app",
    description:
      "Built My Outfit end-to-end, an AI-powered fashion product that lets users virtually try on clothing from real brands using their own photos. Integrated a custom AI try-on engine powered by Nano Banana, covering the full product experience from UX/UI to implementation.",
    image: myOutfit,
  },
  {
    slug: "hariaz",
    title: "Hariaz",
    tag: "Landing page",
    description:
      "Designed and built Hariaz’s landing page with a strong focus on conversion, positioning, and go-to-market execution.",
    image: hariaz,
  },
  {
    slug: "centro-cortinas",
    title: "Centro Cortinas",
    tag: "Landing page",
    description:
      "Designed and built a conversion-focused landing page for a curtain installation and repair service.",
    image: centroCortinas,
  },
];

const WORK_ES_COPY: Record<
  WorkItem["slug"],
  Pick<WorkItem, "tag" | "description">
> = {
  "atiend-calls": {
    tag: "Sitio de producto",
    description:
      "Lideré el desarrollo integral de Atiend Calls, desde la infraestructura de IA y las integraciones de telefonía hasta la UX/UI y el sistema de diseño.",
  },
  atiend: {
    tag: "Sitio de producto",
    description:
      "Desarrollé un panel de mensajería impulsado por IA e integrado con la API oficial de WhatsApp de Meta, con generación automática de presupuestos según fórmulas de precios personalizadas. También desarrollé la gestión del catálogo y las integraciones con sistemas ERP para conectar conversaciones, precios y datos operativos.",
  },
  derk: {
    tag: "Sitio de estudio",
    description:
      "Diseñé y desarrollé un widget web impulsado por IA y centrado en una experiencia conversacional, junto con su panel de administración completo.",
  },
  mazzo: {
    tag: "Sitio de estudio",
    description:
      "Entregué soluciones de software a medida para clientes, generalmente combinando paneles administrativos internos con aplicaciones web orientadas a sus usuarios.",
  },
  metropolitana: {
    tag: "Sitio de estudio",
    description:
      "Desarrollé un sitio completo para una aseguradora, con un sistema de diseño propio, una arquitectura enfocada en SEO y una experiencia de usuario cuidada. También construí un cotizador de seguros de auto conectado a una API para generar estimaciones de pólizas en tiempo real desde el sitio.",
  },
  weekly: {
    tag: "Sitio de producto",
    description:
      "Aplicación móvil en React Native para crear y organizar composiciones de fotos en cuadrícula mediante una experiencia simple y principalmente visual.",
  },
  habitat: {
    tag: "Aplicación web",
    description:
      "Plataforma de networking que conecta emprendedores y empresas, respaldada por un completo panel de administración.",
  },
  atp: {
    tag: "Panel de control",
    description:
      "Transformé el flujo de trabajo de la empresa, basado en Excel, en un panel centralizado de presupuestos de importación y exportación con toda la lógica del negocio integrada. Diseñé la UX/UI y desarrollé componentes para el equipo con el fin de agilizar las tareas diarias y reducir los procesos manuales.",
  },
  gecko: {
    tag: "Sitio de producto",
    description:
      "Realicé control de calidad y pruebas de software para Gecko, una plataforma integral de gestión clínica utilizada en procesos críticos de atención médica.",
  },
  myoutfit: {
    tag: "Aplicación web",
    description:
      "Desarrollé My Outfit de principio a fin: un producto de moda impulsado por IA que permite probarse virtualmente prendas de marcas reales usando fotos propias. Integré un motor personalizado de prueba virtual basado en Nano Banana y cubrí toda la experiencia, desde la UX/UI hasta la implementación.",
  },
  hariaz: {
    tag: "Página de aterrizaje",
    description:
      "Diseñé y desarrollé la página de aterrizaje de Hariaz con un fuerte enfoque en conversión, posicionamiento y estrategia de salida al mercado.",
  },
  "centro-cortinas": {
    tag: "Página de aterrizaje",
    description:
      "Diseñé y desarrollé una página de aterrizaje enfocada en la conversión para un servicio de instalación y reparación de cortinas.",
  },
};

export function getWork(locale: Locale): WorkItem[] {
  if (locale === "en") return WORK;

  return WORK.map((item) => ({
    ...item,
    ...WORK_ES_COPY[item.slug],
  }));
}
