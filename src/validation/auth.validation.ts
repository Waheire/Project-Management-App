import { z } from "zod";

export const emailSchema = z.string().trim().email("Invalid email address").min(1).max(255);
export const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(255, "Password must not exceed 255 characters");

export const registerSchema = z.object({
    name: z.string().min(1).max(255),
    email: emailSchema,
    password: passwordSchema,
});


export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});