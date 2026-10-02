import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { updateItemStatus } from "@/lib/models/items";

export type ClaimStatus = "pending" | "approved" | "rejected";

export type ClaimRow = {
  id: string;
  item_id: string;
  claimant_id: string;
  message: string;
  status: ClaimStatus;
  created_at: string;
  claimant_name: string;
  claimant_email: string;
  claimant_phone: string | null;
};

export type ClaimWithItem = ClaimRow & {
  item_title: string;
  item_type: "lost" | "found";
  item_status: "open" | "claimed" | "resolved";
  item_posted_by: string;
};

export class DuplicateClaimError extends Error {
  constructor() {
    super("You've already submitted a claim for this item.");
    this.name = "DuplicateClaimError";
  }
}

export function createClaim(input: {
  itemId: string;
  claimantId: string;
  message: string;
}): ClaimRow {
  const id = randomUUID();
  try {
    db.prepare(
      `INSERT INTO claims (id, item_id, claimant_id, message)
       VALUES (@id, @itemId, @claimantId, @message)`
    ).run({
      id,
      itemId: input.itemId,
      claimantId: input.claimantId,
      message: input.message.trim(),
    });
  } catch (err) {
    if (err instanceof Error && /UNIQUE constraint failed/.test(err.message)) {
      throw new DuplicateClaimError();
    }
    throw err;
  }
  return getClaimById(id) as ClaimRow;
}

const SELECT_CLAIM = `
  SELECT claims.*, users.name AS claimant_name, users.email AS claimant_email, users.phone AS claimant_phone
  FROM claims
  JOIN users ON users.id = claims.claimant_id
`;

export function getClaimById(id: string): ClaimRow | null {
  const row = db.prepare(`${SELECT_CLAIM} WHERE claims.id = ?`).get(id) as ClaimRow | undefined;
  return row ?? null;
}

export function getClaimWithItem(id: string): ClaimWithItem | null {
  const row = db
    .prepare(
      `SELECT claims.*, users.name AS claimant_name, users.email AS claimant_email, users.phone AS claimant_phone,
              items.title AS item_title, items.type AS item_type, items.status AS item_status, items.posted_by AS item_posted_by
       FROM claims
       JOIN users ON users.id = claims.claimant_id
       JOIN items ON items.id = claims.item_id
       WHERE claims.id = ?`
    )
    .get(id) as ClaimWithItem | undefined;
  return row ?? null;
}

export function getClaimForUserAndItem(itemId: string, userId: string): ClaimRow | null {
  const row = db
    .prepare(`${SELECT_CLAIM} WHERE claims.item_id = ? AND claims.claimant_id = ?`)
    .get(itemId, userId) as ClaimRow | undefined;
  return row ?? null;
}

export function listClaimsForItem(itemId: string): ClaimRow[] {
  return db
    .prepare(`${SELECT_CLAIM} WHERE claims.item_id = ? ORDER BY claims.created_at ASC`)
    .all(itemId) as ClaimRow[];
}

export function listClaimsByUser(userId: string): (ClaimRow & {
  item_title: string;
  item_type: "lost" | "found";
  item_status: "open" | "claimed" | "resolved";
})[] {
  return db
    .prepare(
      `SELECT claims.*, users.name AS claimant_name, users.email AS claimant_email, users.phone AS claimant_phone,
              items.title AS item_title, items.type AS item_type, items.status AS item_status
       FROM claims
       JOIN users ON users.id = claims.claimant_id
       JOIN items ON items.id = claims.item_id
       WHERE claims.claimant_id = ?
       ORDER BY claims.created_at DESC`
    )
    .all(userId) as (ClaimRow & {
    item_title: string;
    item_type: "lost" | "found";
    item_status: "open" | "claimed" | "resolved";
  })[];
}

/** All claims submitted on any item posted by this user (for their dashboard inbox). */
export function listClaimsForPoster(userId: string): ClaimWithItem[] {
  return db
    .prepare(
      `SELECT claims.*, users.name AS claimant_name, users.email AS claimant_email, users.phone AS claimant_phone,
              items.title AS item_title, items.type AS item_type, items.status AS item_status, items.posted_by AS item_posted_by
       FROM claims
       JOIN users ON users.id = claims.claimant_id
       JOIN items ON items.id = claims.item_id
       WHERE items.posted_by = ?
       ORDER BY (claims.status = 'pending') DESC, claims.created_at DESC`
    )
    .all(userId) as ClaimWithItem[];
}

/** Approves a claim, rejects competing pending claims, and marks the item claimed. */
export function approveClaim(claimId: string, itemId: string): void {
  const tx = db.transaction(() => {
    db.prepare("UPDATE claims SET status = 'approved' WHERE id = ?").run(claimId);
    db.prepare(
      "UPDATE claims SET status = 'rejected' WHERE item_id = ? AND id != ? AND status = 'pending'"
    ).run(itemId, claimId);
    updateItemStatus(itemId, "claimed");
  });
  tx();
}

export function rejectClaim(claimId: string): void {
  db.prepare("UPDATE claims SET status = 'rejected' WHERE id = ?").run(claimId);
}
