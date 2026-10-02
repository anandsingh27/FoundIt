"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { ItemSchema } from "@/lib/validation";
import { createItem, deleteItem, getItemById, updateItemStatus } from "@/lib/models/items";
import { saveUploadedImage, deleteUploadedImage, UploadError } from "@/lib/storage";

export type ItemFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function createItemAction(
  _prevState: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  const user = await requireUser();

  const parsed = ItemSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    location: formData.get("location"),
    eventDate: formData.get("eventDate"),
    contactNote: formData.get("contactNote"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let imagePath: string | null = null;
  const file = formData.get("image");
  if (file instanceof File) {
    try {
      imagePath = await saveUploadedImage(file);
    } catch (err) {
      if (err instanceof UploadError) {
        return { error: err.message };
      }
      throw err;
    }
  }

  const item = createItem({
    ...parsed.data,
    contactNote: parsed.data.contactNote || null,
    imagePath,
    postedBy: user.id,
  });

  revalidatePath("/");
  redirect(`/items/${item.id}`);
}

/** Owner or admin marks an item resolved (returned to its owner) or reopens it. */
export async function setItemStatusAction(itemId: string, status: "open" | "resolved") {
  const user = await requireUser();
  const item = getItemById(itemId);
  if (!item) throw new Error("Item not found.");
  if (item.posted_by !== user.id && user.role !== "admin") {
    throw new Error("You don't have permission to update this item.");
  }
  updateItemStatus(itemId, status);
  revalidatePath(`/items/${itemId}`);
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function deleteItemAction(itemId: string) {
  const user = await requireUser();
  const item = getItemById(itemId);
  if (!item) return;
  if (item.posted_by !== user.id && user.role !== "admin") {
    throw new Error("You don't have permission to delete this item.");
  }
  await deleteUploadedImage(item.image_path);
  deleteItem(itemId);
  revalidatePath("/dashboard");
  revalidatePath("/");
  if (user.role === "admin") revalidatePath("/admin");
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}
