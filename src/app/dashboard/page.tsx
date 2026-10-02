import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { listItems } from "@/lib/models/items";
import { listClaimsForPoster, listClaimsByUser } from "@/lib/models/claims";
import { approveClaimAction, rejectClaimAction } from "@/actions/claims";
import { SubmitButton } from "@/components/form";

export default async function DashboardPage() {
  const user = await requireUser();
  const myItems = listItems({ postedBy: user.id });
  const claimsReceived = listClaimsForPoster(user.id);
  const myClaims = listClaimsByUser(user.id);

  const pendingCount = claimsReceived.filter((c) => c.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="font-stamp text-xs uppercase tracking-[0.25em] text-amber-dark">Your desk</p>
      <h1 className="mt-1 mb-8 font-display text-3xl font-semibold text-forest-dark">Dashboard</h1>

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            Claims on your posts {pendingCount > 0 && `(${pendingCount} pending)`}
          </h2>
        </div>
        {claimsReceived.length === 0 ? (
          <p className="text-sm text-ink-faint">No one has claimed any of your posts yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {claimsReceived.map((claim) => (
              <li key={claim.id} className="card-index flex flex-col gap-2 rounded-sm p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/items/${claim.item_id}`} className="font-semibold text-ink hover:text-forest">
                    {claim.item_title}
                  </Link>
                  <p className="text-sm text-ink-soft">
                    {claim.claimant_name} says: <span className="italic">&ldquo;{claim.message}&rdquo;</span>
                  </p>
                  {claim.status === "approved" && (
                    <p className="mt-1 text-xs text-found">
                      Approved — contact: {claim.claimant_email}
                      {claim.claimant_phone ? ` · ${claim.claimant_phone}` : ""}
                    </p>
                  )}
                  {claim.status === "rejected" && (
                    <p className="mt-1 text-xs text-ink-faint">Rejected</p>
                  )}
                </div>
                {claim.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <form action={approveClaimAction.bind(null, claim.id)}>
                      <SubmitButton pendingLabel="…" className="!bg-found px-3 py-1.5 text-xs hover:!bg-found/90">
                        Approve
                      </SubmitButton>
                    </form>
                    <form action={rejectClaimAction.bind(null, claim.id)}>
                      <button
                        type="submit"
                        className="focus-ring rounded-sm border border-line-strong px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft hover:border-lost hover:text-lost"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">Claims you&apos;ve submitted</h2>
        {myClaims.length === 0 ? (
          <p className="text-sm text-ink-faint">You haven&apos;t submitted any claims yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {myClaims.map((claim) => (
              <li key={claim.id} className="card-index flex items-center justify-between rounded-sm p-4">
                <div>
                  <Link href={`/items/${claim.item_id}`} className="font-semibold text-ink hover:text-forest">
                    {claim.item_title}
                  </Link>
                  <p className="text-sm text-ink-soft">
                    Status:{" "}
                    <span
                      className={
                        claim.status === "approved"
                          ? "font-semibold text-found"
                          : claim.status === "rejected"
                            ? "text-ink-faint"
                            : "font-semibold text-amber-dark"
                      }
                    >
                      {claim.status}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Your posts</h2>
          <Link href="/post" className="text-sm font-semibold text-forest hover:underline">
            + Post a new item
          </Link>
        </div>
        {myItems.length === 0 ? (
          <p className="text-sm text-ink-faint">You haven&apos;t posted anything yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {myItems.map((item) => (
              <li key={item.id} className="card-index flex items-center justify-between rounded-sm p-4">
                <div>
                  <Link href={`/items/${item.id}`} className="font-semibold text-ink hover:text-forest">
                    {item.title}
                  </Link>
                  <p className="text-xs uppercase tracking-wide text-ink-faint">
                    {item.type} · {item.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
