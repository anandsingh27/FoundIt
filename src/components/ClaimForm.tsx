"use client";

import { useActionState } from "react";
import { createClaimAction, type ClaimFormState } from "@/actions/claims";
import { SubmitButton, FieldError, FormBanner } from "@/components/form";

export default function ClaimForm({
  itemId,
  itemType,
}: {
  itemId: string;
  itemType: "lost" | "found";
}) {
  const actionWithId = createClaimAction.bind(null, itemId);
  const [state, formAction] = useActionState<ClaimFormState, FormData>(actionWithId, null);

  if (state?.success) {
    return (
      <div className="rounded-sm border border-found/40 bg-found-soft px-4 py-3 text-sm text-found">
        Your claim was submitted. The poster will review it and, if approved, you&apos;ll both be able
        to see each other&apos;s contact details on your dashboard.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormBanner error={state?.error} />
      <label htmlFor="message" className="text-sm font-medium text-ink-soft">
        {itemType === "found"
          ? "Prove it's yours — describe details only the owner would know"
          : "What do you know about this item?"}
      </label>
      <textarea
        id="message"
        name="message"
        required
        rows={3}
        placeholder={
          itemType === "found"
            ? "e.g. It has a small ink stain on the front pocket and my student ID inside…"
            : "e.g. I saw a bag matching this description near the cafeteria yesterday…"
        }
        className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
      />
      <FieldError messages={state?.fieldErrors?.message} />
      <SubmitButton pendingLabel="Submitting…" className="self-start">
        Submit claim
      </SubmitButton>
    </form>
  );
}
