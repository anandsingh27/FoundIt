import { approveClaimAction, rejectClaimAction } from "@/actions/claims";
import { SubmitButton } from "@/components/form";
import type { ClaimRow } from "@/lib/models/claims";

const STATUS_LABEL: Record<ClaimRow["status"], string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function ClaimsPanel({ claims }: { claims: ClaimRow[] }) {
  if (claims.length === 0) {
    return (
      <p className="text-sm text-ink-faint">No one has submitted a claim on this item yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {claims.map((claim) => (
        <li
          key={claim.id}
          className="rounded-sm border border-line bg-paper-soft/60 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-ink">{claim.claimant_name}</p>
            <span
              className={`font-stamp text-[10px] uppercase tracking-wider ${
                claim.status === "approved"
                  ? "text-found"
                  : claim.status === "rejected"
                    ? "text-ink-faint"
                    : "text-amber-dark"
              }`}
            >
              {STATUS_LABEL[claim.status]}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink-soft">{claim.message}</p>

          {claim.status === "approved" && (
            <div className="mt-2 rounded-sm border border-found/30 bg-found-soft px-3 py-2 text-xs text-found">
              Contact: {claim.claimant_email}
              {claim.claimant_phone ? ` · ${claim.claimant_phone}` : ""}
            </div>
          )}

          {claim.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <form action={approveClaimAction.bind(null, claim.id)}>
                <SubmitButton
                  pendingLabel="Approving…"
                  className="!bg-found px-3 py-1.5 text-xs hover:!bg-found/90"
                >
                  Approve
                </SubmitButton>
              </form>
              <form action={rejectClaimAction.bind(null, claim.id)}>
                <button
                  type="submit"
                  className="focus-ring rounded-sm border border-line-strong px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft transition hover:border-lost hover:text-lost"
                >
                  Reject
                </button>
              </form>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
