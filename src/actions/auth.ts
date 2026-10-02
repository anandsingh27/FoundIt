"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SignupSchema, LoginSchema } from "@/lib/validation";
import { createUser, getUserByEmail } from "@/lib/models/users";
import { hashPassword, verifyPassword, createSessionCookie, destroySessionCookie } from "@/lib/auth";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

/** Only ever redirect to a same-origin relative path, never an external URL. */
function safeNext(formData: FormData): string {
  const next = formData.get("next");
  if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export async function signupAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, phone, password } = parsed.data;

  if (getUserByEmail(email)) {
    return { error: "An account with that email already exists. Try logging in instead." };
  }

  const passwordHash = await hashPassword(password);
  const user = createUser({ name, email, phone: phone || null, passwordHash });

  await createSessionCookie({ userId: user.id, role: user.role });
  revalidatePath("/");
  redirect(safeNext(formData));
}

export async function loginAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const user = getUserByEmail(email);
  if (!user) {
    return { error: "No account found with that email." };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { error: "Incorrect password. Please try again." };
  }

  await createSessionCookie({ userId: user.id, role: user.role });
  revalidatePath("/");
  redirect(safeNext(formData));
}

export async function logoutAction(): Promise<void> {
  await destroySessionCookie();
  revalidatePath("/");
  redirect("/login");
}
