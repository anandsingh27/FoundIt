import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="stamp text-lost">404</span>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        This notice has been taken down
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist, or the post may have been removed.
      </p>
      <Link
        href="/"
        className="focus-ring mt-6 rounded-sm bg-forest px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-dark"
      >
        Back to the board
      </Link>
    </div>
  );
}
