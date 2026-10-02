import { z } from "zod";
import { CATEGORIES } from "@/lib/constants";

const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase();

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .refine((value) => !allowedDomain || value.endsWith(`@${allowedDomain}`), {
    message: allowedDomain
      ? `Please use your college email (@${allowedDomain}).`
      : "Enter a valid email address.",
  });

export const SignupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: emailSchema,
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password is too long."),
});

export const LoginSchema = z.object({
  email: z.string().trim().min(1, "Email is required."),
  password: z.string().min(1, "Password is required."),
});

export const ItemSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120),
  description: z.string().trim().min(10, "Please add a bit more detail (10+ characters).").max(2000),
  category: z.enum(CATEGORIES),
  location: z.string().trim().min(2, "Location is required.").max(120),
  eventDate: z.string().trim().min(1, "Date is required."),
  contactNote: z.string().trim().max(300).optional().or(z.literal("")),
});

export const ClaimSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Please describe why this item is yours / what you know (10+ characters).")
    .max(1000),
});
