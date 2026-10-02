#!/usr/bin/env node
// Standalone script (plain Node, not bundled by Next) that creates the first
// admin account. Safe to re-run: it upgrades an existing account's role
// instead of failing if the email already exists.
//
// Usage:
//   ADMIN_EMAIL=admin@college.edu ADMIN_PASSWORD=changeme123 node scripts/seed.mjs
//   node scripts/seed.mjs --demo   (also inserts a few sample lost/found posts)

import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

try {
  process.loadEnvFile();
} catch {
  // No .env file present - that's fine, rely on already-set env vars.
}

const DATA_DIR = process.env.DATABASE_DIR || path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, "lostfound.db");
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS items (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('lost','found')),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL,
  location      TEXT NOT NULL,
  event_date    TEXT NOT NULL,
  image_path    TEXT,
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','claimed','resolved')),
  posted_by     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_note  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS claims (
  id            TEXT PRIMARY KEY,
  item_id       TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimant_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(item_id, claimant_id)
);
`);

const email = (process.env.ADMIN_EMAIL || "admin@example.edu").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "changeme123";
const name = process.env.ADMIN_NAME || "Campus Admin";

if (!process.env.ADMIN_PASSWORD) {
  console.warn(
    `⚠️  ADMIN_PASSWORD not set — using the default password "${password}". Change it after first login, or re-run with ADMIN_PASSWORD set.`
  );
}

const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
const passwordHash = bcrypt.hashSync(password, 10);

if (existing) {
  db.prepare("UPDATE users SET role = 'admin', password_hash = ? WHERE id = ?").run(
    passwordHash,
    existing.id
  );
  console.log(`✅ Existing user ${email} promoted to admin (password reset).`);
} else {
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`
  ).run(randomUUID(), name, email, passwordHash);
  console.log(`✅ Admin account created: ${email} / ${password}`);
}

if (process.argv.includes("--demo")) {
  seedDemoData();
}

function seedDemoData() {
  const demoUserId = ensureDemoUser("demo.student@example.edu", "Alex Rivera");
  const admin = db.prepare("SELECT id FROM users WHERE email = ?").get(email);

  const items = [
    {
      type: "lost",
      title: "Black North Face backpack",
      description:
        "Lost near the main library steps. Has a laptop sleeve and a keychain with a small robot charm.",
      category: "Bags & Backpacks",
      location: "Main Library",
      postedBy: demoUserId,
    },
    {
      type: "found",
      title: "Set of keys with a blue lanyard",
      description: "Found on a bench outside the cafeteria. Three keys and a small bottle opener.",
      category: "Keys",
      location: "Cafeteria / Mess",
      postedBy: admin.id,
    },
    {
      type: "found",
      title: "Student ID card - name starts with 'S'",
      description: "Found in Academic Block A, 2nd floor hallway. Handed to the front desk.",
      category: "ID Cards & Documents",
      location: "Academic Block A",
      postedBy: admin.id,
    },
  ];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO items (id, type, title, description, category, location, event_date, posted_by)
    VALUES (@id, @type, @title, @description, @category, @location, @eventDate, @postedBy)
  `);

  for (const item of items) {
    insert.run({
      id: randomUUID(),
      eventDate: new Date().toISOString().slice(0, 10),
      ...item,
    });
  }
  console.log(`✅ Demo data seeded (login as demo.student@example.edu / demo12345).`);
}

function ensureDemoUser(demoEmail, demoName) {
  const found = db.prepare("SELECT id FROM users WHERE email = ?").get(demoEmail);
  if (found) return found.id;
  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'user')`
  ).run(id, demoName, demoEmail, bcrypt.hashSync("demo12345", 10));
  return id;
}

db.close();
