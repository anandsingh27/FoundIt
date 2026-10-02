"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`focus-ring rounded-sm bg-forest px-4 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? pendingLabel ?? "Working…" : children}
    </button>
  );
}

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs font-medium text-lost">{messages[0]}</p>;
}

export function FormBanner({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <div className="rounded-sm border border-lost/40 bg-lost-soft px-3 py-2 text-sm text-lost">
      {error}
    </div>
  );
}
