"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "@/actions/auth";
import { SubmitButton, FieldError, FormBanner } from "@/components/form";

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormBanner error={state?.error} />

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-soft">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
        />
        <FieldError messages={state?.fieldErrors?.email} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-soft">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
        />
        <FieldError messages={state?.fieldErrors?.password} />
      </div>

      <SubmitButton pendingLabel="Logging in…" className="mt-2 w-full">
        Log in
      </SubmitButton>

      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-forest hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
