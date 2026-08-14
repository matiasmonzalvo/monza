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
      "Led the end-to-end product development of Atiend Calls, from AI infrastructure and telephony integrations to UX/UI and design system. Built and optimized the marketing website with a strong focus on conversion, performance, and advanced SEO.",
    image: atiendCalls,
  },
  {
    slug: "atiend",
    title: "Atiend",
    tag: "Product site",
    description: "Product workflows, Design Engineering",
    image: atiend,
  },

  {
    slug: "derk",
    title: "Derk",
    tag: "Studio site",
    description: "AI complete platform for ai interfaces into websites. ",
    image: derk,
  },
  {
    slug: "mazzo",
    title: "Mazzo Developments",
    tag: "Studio site",
    description:
      "Studio site for a software agency — a strict dark grid, a wireframe globe, and the process laid out step by step.",
    image: mazzo,
  },
  {
    slug: "metropolitana",
    title: "Metropolitana Seguros",
    tag: "Studio site",
    description:
      "Studio site for a software agency — a strict dark grid, a wireframe globe, and the process laid out step by step.",
    image: metro,
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
    slug: "atp",
    title: "ATP",
    tag: "Dashboard",
    description:
      "Quoting dashboard with a side-by-side admin panel for assigning requests and tracking every quote through to close.",
    image: atp,
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
