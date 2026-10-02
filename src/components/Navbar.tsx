import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { logoutAction } from "@/actions/auth";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-line-strong/70 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 rotate-[-6deg] items-center justify-center rounded-sm bg-forest text-paper shadow-sm transition group-hover:rotate-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 21s-7.5-5.2-9.7-9.6C.7 7.9 2.6 4 6.4 4c2 0 3.4 1 5.6 3.3C14.2 5 15.6 4 17.6 4c3.8 0 5.7 3.9 4.1 7.4C19.5 15.8 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
              />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-forest-dark">
            FoundIt
          </span>
          <span className="hidden font-stamp text-[10px] uppercase tracking-[0.2em] text-ink-faint sm:inline">
            campus board
          </span>
        </Link>

        <nav className="flex items-center gap-1 font-stamp text-xs uppercase tracking-wide sm:gap-2 sm:text-[13px]">
          <NavLink href="/">Browse</NavLink>
          <NavLink href="/post">Post an item</NavLink>
          {user && <NavLink href="/dashboard">Dashboard</NavLink>}
          {user?.role === "admin" && <NavLink href="/admin">Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-ink-soft sm:inline">
                Hi, {user.name.split(" ")[0]}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="focus-ring rounded-sm border border-line-strong bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft transition hover:border-lost hover:text-lost"
                >
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="focus-ring rounded-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft transition hover:text-forest"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="focus-ring rounded-sm bg-forest px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:bg-forest-dark"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="focus-ring rounded-sm px-2.5 py-1.5 text-ink-soft transition hover:bg-forest-soft hover:text-forest-dark"
    >
      {children}
    </Link>
  );
}
