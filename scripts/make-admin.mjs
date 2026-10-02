#!/usr/bin/env node
// Usage: node scripts/make-admin.mjs someone@college.edu
import path from "node:path";
import Database from "better-sqlite3";

try {
  process.loadEnvFile();
} catch {
  // No .env file present - rely on already-set env vars.
}

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const DATA_DIR = process.env.DATABASE_DIR || path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, "lostfound.db");

const db = new Database(DB_PATH);
const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

if (!user) {
  console.error(`No user found with email ${email}. They need to sign up first.`);
  process.exit(1);
}

db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
console.log(`✅ ${email} is now an admin.`);
db.close();
