import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export type UserRole = "user" | "admin";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: UserRole;
  created_at: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
};

function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function getUserByEmail(email: string): UserRow | null {
  const row = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.trim().toLowerCase()) as UserRow | undefined;
  return row ?? null;
}

export function getUserById(id: string): PublicUser | null {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? toPublicUser(row) : null;
}

export function createUser(input: {
  name: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  role?: UserRole;
}): PublicUser {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, name, email, phone, password_hash, role)
     VALUES (@id, @name, @email, @phone, @passwordHash, @role)`
  ).run({
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    passwordHash: input.passwordHash,
    role: input.role ?? "user",
  });
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow;
  return toPublicUser(row);
}

export function countUsers(): number {
  const row = db.prepare("SELECT COUNT(*) as n FROM users").get() as { n: number };
  return row.n;
}

export function listUsers(): PublicUser[] {
  const rows = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all() as UserRow[];
  return rows.map(toPublicUser);
}

export function setUserRole(userId: string, role: UserRole): void {
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, userId);
}
