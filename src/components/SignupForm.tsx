"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type AuthState } from "@/actions/auth";
import { SubmitButton, FieldError, FormBanner } from "@/components/form";

export default function SignupForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(signupAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormBanner error={state?.error} />

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink-soft">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
        />
        <FieldError messages={state?.fieldErrors?.name} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-soft">
          College email
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
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink-soft">
          Phone <span className="font-normal text-ink-faint">(optional, shown only if a claim is approved)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
        />
        <FieldError messages={state?.fieldErrors?.phone} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-soft">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
        />
        <FieldError messages={state?.fieldErrors?.password} />
        <p className="mt-1 text-xs text-ink-faint">At least 8 characters.</p>
      </div>

      <SubmitButton pendingLabel="Creating account…" className="mt-2 w-full">
        Create account
      </SubmitButton>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-forest hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
