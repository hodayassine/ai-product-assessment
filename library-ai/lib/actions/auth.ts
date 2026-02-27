"use server";

import { prisma } from "@/lib/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { signUpSchema } from "@/lib/validations/auth";

export type SignUpResult = { success: true } | { success: false; error: string };

export async function signUp(formData: FormData): Promise<SignUpResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    name: (formData.get("name") as string) || undefined,
  };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const msg =
      flat.email?.[0] ??
      flat.password?.[0] ??
      flat.confirmPassword?.[0] ??
      "Invalid input.";
    return { success: false, error: msg };
  }
  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "An account with this email already exists." };

  const userCount = await prisma.user.count();
  const hashed = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      name: name?.trim() || null,
      password: hashed,
      role: userCount === 0 ? "ADMIN" : "MEMBER",
    },
  });
  return { success: true };
}
