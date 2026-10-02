import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { getUserById, type PublicUser } from "@/lib/models/users";

/**
 * Verifies the session cookie once per request (memoized) and returns the
 * decoded payload, or null if the visitor is not signed in.
 */
export const verifySession = cache(async () => {
  const session = await readSession();
  if (!session?.userId) return null;
  return session;
});

/**
 * Returns the current signed-in user's public profile, or null.
 * Safe to call from any Server Component or Server Action.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const session = await verifySession();
  if (!session) return null;
  const user = getUserById(session.userId);
  return user;
});

/** Redirects to /login if there is no signed-in user. */
export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/** Redirects to / if the signed-in user is not an admin. */
export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
}
