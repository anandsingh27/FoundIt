"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { CATEGORIES } from "@/lib/constants";

const TYPE_TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentType = searchParams.get("type") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentQ = searchParams.get("q") ?? "";

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="card-index rounded-sm p-4 sm:p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          pushParams({ q: String(formData.get("q") ?? "") });
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={currentQ}
            placeholder="Search by keyword, e.g. 'black backpack' or 'library'"
            className="focus-ring w-full rounded-sm border border-line-strong bg-card py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint"
          />
        </div>
        <select
          value={currentCategory}
          onChange={(e) => pushParams({ category: e.target.value })}
          className="focus-ring rounded-sm border border-line-strong bg-card py-2.5 px-3 text-sm text-ink-soft sm:w-56"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="focus-ring rounded-sm bg-forest px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-dark"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex items-center gap-2 font-stamp text-xs uppercase tracking-wide">
        {TYPE_TABS.map((tab) => {
          const active = currentType === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => pushParams({ type: tab.value })}
              className={`focus-ring rounded-full border px-3 py-1.5 transition ${
                active
                  ? "border-forest bg-forest text-paper"
                  : "border-line-strong bg-card text-ink-soft hover:border-forest hover:text-forest"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        {isPending && <span className="text-ink-faint normal-case">Updating…</span>}
        {(currentType || currentCategory || currentQ) && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="focus-ring ml-auto rounded-full px-3 py-1.5 text-ink-faint underline decoration-dotted underline-offset-4 hover:text-lost"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
