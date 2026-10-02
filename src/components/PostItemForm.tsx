"use client";

import { useActionState, useState } from "react";
import { createItemAction, type ItemFormState } from "@/actions/items";
import { SubmitButton, FieldError, FormBanner } from "@/components/form";
import { CATEGORIES, CAMPUS_LOCATIONS } from "@/lib/constants";

export default function PostItemForm({ defaultType }: { defaultType: "lost" | "found" }) {
  const [state, formAction] = useActionState<ItemFormState, FormData>(createItemAction, null);
  const [type, setType] = useState<"lost" | "found">(defaultType);
  const [preview, setPreview] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-5" encType="multipart/form-data">
      <FormBanner error={state?.error} />

      <div>
        <span className="mb-2 block text-sm font-medium text-ink-soft">This item was…</span>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`focus-ring cursor-pointer rounded-sm border-2 px-4 py-3 text-center text-sm font-semibold transition ${
              type === "lost"
                ? "border-lost bg-lost-soft text-lost"
                : "border-line-strong bg-card text-ink-soft hover:border-lost/60"
            }`}
          >
            <input
              type="radio"
              name="type"
              value="lost"
              checked={type === "lost"}
              onChange={() => setType("lost")}
              className="sr-only"
            />
            Lost — I&apos;m missing this
          </label>
          <label
            className={`focus-ring cursor-pointer rounded-sm border-2 px-4 py-3 text-center text-sm font-semibold transition ${
              type === "found"
                ? "border-found bg-found-soft text-found"
                : "border-line-strong bg-card text-ink-soft hover:border-found/60"
            }`}
          >
            <input
              type="radio"
              name="type"
              value="found"
              checked={type === "found"}
              onChange={() => setType("found")}
              className="sr-only"
            />
            Found — I have this
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink-soft">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="e.g. Navy blue Jansport backpack"
          className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
        />
        <FieldError messages={state?.fieldErrors?.title} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink-soft">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="Color, brand, distinguishing marks, contents, where exactly it was lost/found…"
          className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
        />
        <FieldError messages={state?.fieldErrors?.description} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-ink-soft">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue=""
            className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
          >
            <option value="" disabled>
              Choose a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError messages={state?.fieldErrors?.category} />
        </div>

        <div>
          <label htmlFor="eventDate" className="mb-1 block text-sm font-medium text-ink-soft">
            Date {type === "lost" ? "lost" : "found"}
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            required
            defaultValue={today}
            max={today}
            className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
          />
          <FieldError messages={state?.fieldErrors?.eventDate} />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="mb-1 block text-sm font-medium text-ink-soft">
          Location
        </label>
        <input
          id="location"
          name="location"
          list="campus-locations"
          required
          placeholder="e.g. Main Library, 2nd floor"
          className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
        />
        <datalist id="campus-locations">
          {CAMPUS_LOCATIONS.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
        <FieldError messages={state?.fieldErrors?.location} />
      </div>

      <div>
        <label htmlFor="image" className="mb-1 block text-sm font-medium text-ink-soft">
          Photo <span className="font-normal text-ink-faint">(optional, but helps a lot)</span>
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="focus-ring w-full rounded-sm border border-dashed border-line-strong bg-card px-3 py-2.5 text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-forest-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:text-forest-dark"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Selected preview"
            className="mt-3 h-40 w-40 rounded-sm border border-line object-cover"
          />
        )}
      </div>

      <div>
        <label htmlFor="contactNote" className="mb-1 block text-sm font-medium text-ink-soft">
          Note for claimants <span className="font-normal text-ink-faint">(optional)</span>
        </label>
        <input
          id="contactNote"
          name="contactNote"
          placeholder="e.g. Best reached after 5pm, or pick up from the security desk"
          className="focus-ring w-full rounded-sm border border-line-strong bg-card px-3 py-2.5 text-sm"
        />
        <FieldError messages={state?.fieldErrors?.contactNote} />
      </div>

      <SubmitButton pendingLabel="Posting…" className="w-full sm:w-auto sm:self-start">
        Pin to the board
      </SubmitButton>
    </form>
  );
}
