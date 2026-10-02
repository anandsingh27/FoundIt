import { requireUser } from "@/lib/dal";
import PostItemForm from "@/components/PostItemForm";

type Props = { searchParams: Promise<{ type?: string }> };

export default async function PostItemPage({ searchParams }: Props) {
  await requireUser();
  const { type } = await searchParams;
  const defaultType = type === "found" ? "found" : "lost";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-stamp text-xs uppercase tracking-[0.25em] text-amber-dark">New notice</p>
      <h1 className="mt-1 mb-1 font-display text-3xl font-semibold text-forest-dark">
        Pin an item to the board
      </h1>
      <p className="mb-8 text-sm text-ink-soft">
        Give as much detail as you can — it&apos;s what helps the right person find this post.
      </p>
      <div className="card-index rounded-sm p-6 sm:p-8">
        <PostItemForm defaultType={defaultType} />
      </div>
    </div>
  );
}
