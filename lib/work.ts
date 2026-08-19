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
