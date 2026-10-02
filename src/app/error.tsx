"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="stamp text-lost">Oops</span>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Something tore loose</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="focus-ring mt-6 rounded-sm bg-forest px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-dark"
      >
        Try again
      </button>
    </div>
  );
}
