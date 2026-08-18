import { ArrowRight } from "reicon-react";
import { ParticlePortrait } from "@/components/backgrounds/particle-portrait";
import { GmailIcon, LinkedInIcon, XIcon } from "@/components/icons/brand";
import { Cell, CellGrid } from "@/components/layout/grid";

// Placeholders — swap these for your real handles.
const EMAIL = "hello@yourdomain.com";

const CHANNELS = [
  { label: "Email", icon: GmailIcon, value: EMAIL, href: `mailto:${EMAIL}` },
  {
    label: "LinkedIn",
    icon: LinkedInIcon,
    value: "/in/yourhandle",
    href: "https://linkedin.com",
  },
  { label: "X", icon: XIcon, value: "@yourhandle", href: "https://x.com" },
];

export function Contact() {
  return (
    <CellGrid className="grid-cols-1">
      {/* The cell carries no padding of its own so the rule below the copy can
          run rail to rail, like every other rule on the page. */}
      <Cell className="w-full overflow-hidden">
        <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-8 sm:py-14">
          <h2 className="text-6xl font-medium leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-7xl ">
            Get in touch
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Tell me what you are building and let's work on it.
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-7 inline-flex h-10 items-center rounded-full border border-foreground bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            Start a conversation
          </a>
        </div>
      </Cell>

      <Cell className="flex h-[42vh] min-h-0 flex-col overflow-hidden">
        <ParticlePortrait src="/contact-illustration.png" />
      </Cell>

      <Cell className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-border">
        {CHANNELS.map(({ icon: Icon, ...channel }) => (
          <a
            key={channel.label}
            href={channel.href}
            target={channel.href.startsWith("http") ? "_blank" : undefined}
            rel={
              channel.href.startsWith("http")
                ? "noreferrer noopener"
                : undefined
            }
            className="group flex flex-col justify-between gap-6 p-6 transition-colors last:border-b-0 hover:bg-surface"
          >
            <span className="flex text-subtle">
              <Icon size={18} />
              <span className="sr-only">{channel.label}</span>
            </span>
            <span className="flex items-center justify-between gap-2 text-sm text-foreground">
              {channel.value}
              <ArrowRight
                size={14}
                weight="Outline"
                aria-hidden="true"
                className="text-subtle transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </a>
        ))}
      </Cell>
    </CellGrid>
  );
}
