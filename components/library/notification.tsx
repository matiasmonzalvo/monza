import { cn } from "@/lib/cn";

export type NotificationVersion = "border" | "solid" | "blur";

const SURFACES = {
  border: "border-border bg-background",
  solid: "border-transparent bg-surface-2",
  blur: "border-white/50 bg-background/65 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10",
} satisfies Record<NotificationVersion, string>;

export type NotificationProps = {
  version?: NotificationVersion;
  title?: string;
  description?: string;
  sentAt?: string;
  dateTime?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function Notification({
  version = "border",
  title = "Today Only!",
  description = "Enjoy an exclusive deal on your favorite brew! Don't miss out!",
  sentAt = "now",
  dateTime,
  imageSrc,
  imageAlt = "",
  className,
}: NotificationProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex w-full items-center gap-3.5 rounded-[1.75rem] border px-5 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)]",
        "text-foreground dark:shadow-[0_12px_32px_rgba(0,0,0,0.42)]",
        SURFACES[version],
        className,
      )}
    >
      <span className="relative flex size-12 shrink-0 overflow-hidden rounded-[0.9rem] bg-foreground text-background shadow-sm">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="size-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="m-auto text-[22px] font-semibold leading-none tracking-[-0.06em]"
          >
            M
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex min-w-0 items-baseline gap-3">
          <p className="min-w-0 flex-1 truncate text-[17px] font-semibold leading-[1.25] tracking-[-0.018em]">
            {title}
          </p>
          <time
            dateTime={dateTime}
            className="shrink-0 text-[15px] leading-[1.25] tracking-[-0.012em] text-muted-foreground"
          >
            {sentAt}
          </time>
        </div>

        <p className="mt-0.5 text-[16px] leading-[1.3] tracking-[-0.012em] text-foreground/90">
          {description}
        </p>
      </div>
    </div>
  );
}
