import Link from "next/link";
import Image from "next/image";
import type { ItemRow } from "@/lib/models/items";

const TYPE_STYLES: Record<ItemRow["type"], { label: string; className: string }> = {
  lost: { label: "Lost", className: "bg-lost-soft text-lost" },
  found: { label: "Found", className: "bg-found-soft text-found" },
};

const STATUS_STYLES: Record<ItemRow["status"], { label: string; className: string }> = {
  open: { label: "Open", className: "text-forest" },
  claimed: { label: "Claim pending", className: "text-amber-dark" },
  resolved: { label: "Resolved", className: "text-ink-faint" },
};

export default function ItemCard({ item, tilt = 0 }: { item: ItemRow; tilt?: number }) {
  const type = TYPE_STYLES[item.type];
  const status = STATUS_STYLES[item.status];

  return (
    <Link
      href={`/items/${item.id}`}
      style={{ transform: `rotate(${tilt}deg)` }}
      className="lift-on-hover card-index focus-ring relative flex flex-col overflow-hidden rounded-sm"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-line bg-paper-soft">
        {item.image_path ? (
          <Image
            src={item.image_path}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint">
            <PlaceholderIcon category={item.category} />
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-sm px-2 py-0.5 font-stamp text-[10px] font-semibold uppercase tracking-wider ${type.className}`}
        >
          {type.label}
        </span>
        {item.status !== "open" && (
          <span className="stamp absolute right-2 top-3 rotate-6 bg-card/90 px-1.5 py-0 text-[9px] text-ink-soft">
            {status.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="font-display text-base font-semibold leading-snug text-ink line-clamp-2">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink-soft">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2 font-stamp text-[10px] uppercase tracking-wide text-ink-faint">
          <span className="truncate">{item.location}</span>
          <span>{formatShortDate(item.event_date)}</span>
        </div>
      </div>
    </Link>
  );
}

function formatShortDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function PlaceholderIcon({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 opacity-60">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7h16M4 7l1.2 12A2 2 0 0 0 7.2 21h9.6a2 2 0 0 0 2-1.8L20 7M9 11v5M15 11v5M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-stamp text-[9px] uppercase tracking-wider">{category}</span>
    </div>
  );
}
