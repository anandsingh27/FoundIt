import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "claimed" | "resolved";

export type ItemRow = {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  image_path: string | null;
  status: ItemStatus;
  posted_by: string;
  contact_note: string | null;
  created_at: string;
  updated_at: string;
  poster_name: string;
};

export type ItemFilters = {
  type?: ItemType;
  status?: ItemStatus;
  category?: string;
  q?: string;
  postedBy?: string;
  limit?: number;
};

const SELECT_BASE = `
  SELECT items.*, users.name AS poster_name
  FROM items
  JOIN users ON users.id = items.posted_by
`;

export function listItems(filters: ItemFilters = {}): ItemRow[] {
  const clauses: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.type) {
    clauses.push("items.type = @type");
    params.type = filters.type;
  }
  if (filters.status) {
    clauses.push("items.status = @status");
    params.status = filters.status;
  }
  if (filters.category) {
    clauses.push("items.category = @category");
    params.category = filters.category;
  }
  if (filters.postedBy) {
    clauses.push("items.posted_by = @postedBy");
    params.postedBy = filters.postedBy;
  }
  if (filters.q) {
    clauses.push(
      "(items.title LIKE @q OR items.description LIKE @q OR items.location LIKE @q)"
    );
    params.q = `%${filters.q}%`;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = filters.limit ? `LIMIT @limit` : "";
  if (filters.limit) params.limit = filters.limit;

  const sql = `${SELECT_BASE} ${where} ORDER BY items.created_at DESC ${limit}`;
  return db.prepare(sql).all(params) as ItemRow[];
}

export function getItemById(id: string): ItemRow | null {
  const row = db.prepare(`${SELECT_BASE} WHERE items.id = ?`).get(id) as ItemRow | undefined;
  return row ?? null;
}

export function createItem(input: {
  type: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  eventDate: string;
  imagePath?: string | null;
  postedBy: string;
  contactNote?: string | null;
}): ItemRow {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO items (id, type, title, description, category, location, event_date, image_path, posted_by, contact_note)
     VALUES (@id, @type, @title, @description, @category, @location, @eventDate, @imagePath, @postedBy, @contactNote)`
  ).run({
    id,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    location: input.location.trim(),
    eventDate: input.eventDate,
    imagePath: input.imagePath ?? null,
    postedBy: input.postedBy,
    contactNote: input.contactNote?.trim() || null,
  });
  return getItemById(id) as ItemRow;
}

export function updateItemStatus(id: string, status: ItemStatus): void {
  db.prepare("UPDATE items SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
    status,
    id
  );
}

export function deleteItem(id: string): void {
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
}

export function countItems(): { total: number; lost: number; found: number; open: number; resolved: number } {
  const total = (db.prepare("SELECT COUNT(*) n FROM items").get() as { n: number }).n;
  const lost = (
    db.prepare("SELECT COUNT(*) n FROM items WHERE type = 'lost'").get() as { n: number }
  ).n;
  const found = (
    db.prepare("SELECT COUNT(*) n FROM items WHERE type = 'found'").get() as { n: number }
  ).n;
  const open = (
    db.prepare("SELECT COUNT(*) n FROM items WHERE status = 'open'").get() as { n: number }
  ).n;
  const resolved = (
    db.prepare("SELECT COUNT(*) n FROM items WHERE status = 'resolved'").get() as {
      n: number;
    }
  ).n;
  return { total, lost, found, open, resolved };
}
