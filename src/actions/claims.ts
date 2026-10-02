"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { ClaimSchema } from "@/lib/validation";
import { getItemById } from "@/lib/models/items";
import {
  approveClaim,
  createClaim,
  DuplicateClaimError,
  getClaimWithItem,
  rejectClaim,
} from "@/lib/models/claims";

export type ClaimFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

export async function createClaimAction(
  itemId: string,
  _prevState: ClaimFormState,
  formData: FormData
): Promise<ClaimFormState> {
  const user = await requireUser();

  const item = getItemById(itemId);
  if (!item) {
    return { error: "This item no longer exists." };
  }
  if (item.posted_by === user.id) {
    return { error: "You can't submit a claim on your own post." };
  }
  if (item.status !== "open") {
    return { error: "This item is no longer open for claims." };
  }

  const parsed = ClaimSchema.safeParse({ message: formData.get("message") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    createClaim({ itemId, claimantId: user.id, message: parsed.data.message });
  } catch (err) {
    if (err instanceof DuplicateClaimError) {
      return { error: err.message };
    }
    throw err;
  }

  revalidatePath(`/items/${itemId}`);
  return { success: true };
}

export async function approveClaimAction(claimId: string) {
  const user = await requireUser();
  const claim = getClaimWithItem(claimId);
  if (!claim) throw new Error("Claim not found.");
  if (claim.item_posted_by !== user.id && user.role !== "admin") {
    throw new Error("You don't have permission to manage this claim.");
  }
  approveClaim(claimId, claim.item_id);
  revalidatePath(`/items/${claim.item_id}`);
  revalidatePath("/dashboard");
}

export async function rejectClaimAction(claimId: string) {
  const user = await requireUser();
  const claim = getClaimWithItem(claimId);
  if (!claim) throw new Error("Claim not found.");
  if (claim.item_posted_by !== user.id && user.role !== "admin") {
    throw new Error("You don't have permission to manage this claim.");
  }
  rejectClaim(claimId);
  revalidatePath(`/items/${claim.item_id}`);
  revalidatePath("/dashboard");
}
