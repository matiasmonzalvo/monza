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
      "Split-screen entry point for a neighbourhood platform: the brand on one side, the shortest path to an account on the other.",
    image: habitat,
  },
  {
    slug: "atp",
    title: "ATP",
    tag: "Dashboard",
    description:
      "Quoting dashboard with a side-by-side admin panel for assigning requests and tracking every quote through to close.",
    image: atp,
  },

  {
    slug: "gecko",
    title: "Gecko",
    tag: "Product site",
    description:
      "Landing and feature grid for an end-to-end medical practice platform: records, scheduling and billing in the cloud.",
    image: gecko,
  },

  {
    slug: "myoutfit",
    title: "My Outfit",
    tag: "Web app",
    description:
      "Catalogue and dressing room on one screen — pick pieces on the left, watch them land on the model on the right.",
    image: myOutfit,
  },
  {
    slug: "hariaz",
    title: "Hariaz",
    tag: "Landing page",
    description:
      "Sales page for an AI-employee platform, built around a single illustrated claim and the stack it plugs into.",
    image: hariaz,
  },
  {
    slug: "centro-cortinas",
    title: "Centro Cortinas",
    tag: "Landing page",
    description:
      "Service site for a curtain install-and-repair shop, anchored by a full-bleed strip of real jobs instead of stock photography.",
    image: centroCortinas,
  },
];
