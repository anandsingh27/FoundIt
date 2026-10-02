import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/models/items";
import { getClaimForUserAndItem, listClaimsForItem } from "@/lib/models/claims";
import { getCurrentUser } from "@/lib/dal";
import ClaimForm from "@/components/ClaimForm";
import ClaimsPanel from "@/components/ClaimsPanel";
import { SubmitButton } from "@/components/form";
import { deleteItemAction, setItemStatusAction } from "@/actions/items";

type Props = { params: Promise<{ id: string }> };

const TYPE_STYLES = {
  lost: { label: "Lost", className: "bg-lost-soft text-lost" },
  found: { label: "Found", className: "bg-found-soft text-found" },
} as const;

const STATUS_STYLES = {
  open: { label: "Open", className: "bg-forest-soft text-forest-dark" },
  claimed: { label: "Claim pending", className: "bg-amber-soft text-amber-dark" },
  resolved: { label: "Resolved", className: "bg-paper-soft text-ink-faint" },
} as const;

export default async function ItemDetailPage({ params }: Props) {
  const { id } = await params;
  const item = getItemById(id);
  if (!item) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === item.posted_by;
  const isAdmin = user?.role === "admin";
  const canManage = isOwner || isAdmin;

  const myClaim = user && !canManage ? getClaimForUserAndItem(item.id, user.id) : null;
  const claims = canManage ? listClaimsForItem(item.id) : [];

  const type = TYPE_STYLES[item.type];
  const status = STATUS_STYLES[item.status];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/" className="text-sm text-ink-soft hover:text-forest">
        ← Back to the board
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="card-index relative aspect-square overflow-hidden rounded-sm">
            {item.image_path ? (
              <Image src={item.image_path} alt={item.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-stamp text-xs uppercase tracking-wider text-ink-faint">
                No photo provided
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-sm px-2.5 py-1 font-stamp text-[11px] font-semibold uppercase tracking-wider ${type.className}`}
            >
              {type.label}
            </span>
            <span
              className={`rounded-sm px-2.5 py-1 font-stamp text-[11px] font-semibold uppercase tracking-wider ${status.className}`}
            >
              {status.label}
            </span>
            <span className="rounded-sm bg-paper-soft px-2.5 py-1 font-stamp text-[11px] uppercase tracking-wider text-ink-soft">
              {item.category}
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{item.title}</h1>
          <p className="mt-3 whitespace-pre-wrap text-ink-soft">{item.description}</p>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
            <div>
              <dt className="font-stamp text-[10px] uppercase tracking-wide text-ink-faint">
                Location
              </dt>
              <dd className="text-ink">{item.location}</dd>
            </div>
            <div>
              <dt className="font-stamp text-[10px] uppercase tracking-wide text-ink-faint">
                Date {item.type === "lost" ? "lost" : "found"}
              </dt>
              <dd className="text-ink">
                {new Date(item.event_date).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="font-stamp text-[10px] uppercase tracking-wide text-ink-faint">
                Posted by
              </dt>
              <dd className="text-ink">{item.poster_name}</dd>
            </div>
            <div>
              <dt className="font-stamp text-[10px] uppercase tracking-wide text-ink-faint">
                Posted on
              </dt>
              <dd className="text-ink">
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>

          {item.contact_note && (
            <p className="mt-4 rounded-sm border border-line bg-paper-soft/70 px-3 py-2 text-sm text-ink-soft">
              <span className="font-semibold text-ink">Note from poster:</span> {item.contact_note}
            </p>
          )}

          {canManage && (
            <div className="mt-5 flex flex-wrap gap-2">
              {item.status !== "resolved" ? (
                <form action={setItemStatusAction.bind(null, item.id, "resolved")}>
                  <SubmitButton pendingLabel="Updating…">Mark as resolved</SubmitButton>
                </form>
              ) : (
                <form action={setItemStatusAction.bind(null, item.id, "open")}>
                  <SubmitButton pendingLabel="Updating…" className="!bg-amber hover:!bg-amber-dark">
                    Reopen
                  </SubmitButton>
                </form>
              )}
              <form action={deleteItemAction.bind(null, item.id)}>
                <button
                  type="submit"
                  className="focus-ring rounded-sm border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-lost hover:text-lost"
                >
                  Delete post
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 border-t-2 border-line-strong/60 pt-8">
        {canManage ? (
          <>
            <h2 className="mb-4 font-display text-xl font-semibold text-forest-dark">
              Claims on this post
            </h2>
            <ClaimsPanel claims={claims} />
          </>
        ) : item.status !== "open" ? (
          <p className="text-sm text-ink-faint">
            This item is no longer open — it {item.status === "resolved" ? "has been resolved" : "already has a claim being processed"}.
          </p>
        ) : myClaim ? (
          <div>
            <h2 className="mb-2 font-display text-xl font-semibold text-forest-dark">
              Your claim
            </h2>
            <p className="text-sm text-ink-soft">
              Status:{" "}
              <span className="font-semibold text-ink">
                {myClaim.status === "pending"
                  ? "Waiting for the poster to review"
                  : myClaim.status === "approved"
                    ? "Approved — check your dashboard for contact details"
                    : "Not approved"}
              </span>
            </p>
          </div>
        ) : user ? (
          <div>
            <h2 className="mb-3 font-display text-xl font-semibold text-forest-dark">
              {item.type === "found" ? "Is this yours?" : "Do you have information?"}
            </h2>
            <ClaimForm itemId={item.id} itemType={item.type} />
          </div>
        ) : (
          <div className="card-index rounded-sm p-5 text-center">
            <p className="text-sm text-ink-soft">
              <Link
                href={`/login?next=/items/${item.id}`}
                className="font-semibold text-forest hover:underline"
              >
                Log in
              </Link>{" "}
              to submit a claim on this item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
