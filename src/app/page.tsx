import Link from "next/link";
import SearchFilters from "@/components/SearchFilters";
import ItemCard from "@/components/ItemCard";
import { listItems, type ItemType } from "@/lib/models/items";

type Props = {
  searchParams: Promise<{ type?: string; category?: string; q?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const type = params.type === "lost" || params.type === "found" ? (params.type as ItemType) : undefined;

  const items = listItems({
    type,
    category: params.category || undefined,
    q: params.q || undefined,
    status: "open",
  });

  return (
    <div>
      <section className="border-b-2 border-line-strong/60 bg-paper-soft">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="font-stamp text-xs uppercase tracking-[0.25em] text-amber-dark">
            Campus lost &amp; found
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-tight text-forest-dark sm:text-5xl">
            Lost something? Found something?
            <br />
            Pin it to the board.
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            A shared noticeboard for the whole campus — report what you&apos;ve lost, post what
            you&apos;ve found, and get things back to the people who need them.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/post?type=lost"
              className="focus-ring rounded-sm bg-lost px-4 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:brightness-110"
            >
              I lost something
            </Link>
            <Link
              href="/post?type=found"
              className="focus-ring rounded-sm bg-found px-4 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:brightness-110"
            >
              I found something
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <SearchFilters />

        <div className="mt-8 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            {items.length} {items.length === 1 ? "item" : "items"} on the board
          </h2>
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, i) => (
              <ItemCard key={item.id} item={item} tilt={i % 5 === 0 ? -1.5 : i % 3 === 0 ? 1.5 : 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card-index mt-6 flex flex-col items-center gap-2 rounded-sm border-dashed py-16 text-center">
      <p className="font-display text-lg text-ink">Nothing pinned here yet</p>
      <p className="max-w-sm text-sm text-ink-soft">
        Try clearing your filters, or be the first to post a lost or found item.
      </p>
    </div>
  );
}
