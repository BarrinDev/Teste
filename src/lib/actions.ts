"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  subscriberSchema,
  subscriberUpdateSchema,
  paymentSchema,
} from "@/lib/validations";

export type ActionState = {
  message?: string;
  errors?: Record<string, string[]>;
} | undefined;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function authenticate(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { message: "Preencha usuário e senha." };
  }

  try {
    await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Usuário ou senha inválidos." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function createSubscriber(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = subscriberSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    plan: formData.get("plan"),
    startDate: formData.get("startDate"),
    expiresAt: formData.get("expiresAt"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { amount, ...data } = parsed.data;

  const subscriber = await prisma.subscriber.create({
    data: {
      name: data.name,
      contact: data.contact,
      plan: data.plan,
      startDate: new Date(data.startDate),
      expiresAt: new Date(data.expiresAt),
      payments: {
        create: {
          amountCents: amount,
          plan: data.plan,
          paidAt: new Date(data.startDate),
        },
      },
    },
  });

  revalidatePath("/subscribers");
  revalidatePath("/dashboard");
  redirect(`/subscribers/${subscriber.id}`);
}

export async function updateSubscriber(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = subscriberUpdateSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    plan: formData.get("plan"),
    startDate: formData.get("startDate"),
    expiresAt: formData.get("expiresAt"),
    cancelled: formData.get("cancelled") === "on",
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  await prisma.subscriber.update({
    where: { id },
    data: {
      name: parsed.data.name,
      contact: parsed.data.contact,
      plan: parsed.data.plan,
      startDate: new Date(parsed.data.startDate),
      expiresAt: new Date(parsed.data.expiresAt),
      cancelled: parsed.data.cancelled,
    },
  });

  revalidatePath("/subscribers");
  revalidatePath(`/subscribers/${id}`);
  revalidatePath("/dashboard");
  redirect(`/subscribers/${id}`);
}

export async function deleteSubscriber(id: string) {
  await requireAdmin();
  await prisma.subscriber.delete({ where: { id } });
  revalidatePath("/subscribers");
  revalidatePath("/dashboard");
  redirect("/subscribers");
}

export async function addPayment(
  subscriberId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    plan: formData.get("plan"),
    paidAt: formData.get("paidAt"),
    newExpiresAt: formData.get("newExpiresAt"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        subscriberId,
        amountCents: parsed.data.amount,
        plan: parsed.data.plan,
        paidAt: new Date(parsed.data.paidAt),
      },
    }),
    prisma.subscriber.update({
      where: { id: subscriberId },
      data: {
        plan: parsed.data.plan,
        expiresAt: new Date(parsed.data.newExpiresAt),
        cancelled: false,
      },
    }),
  ]);

  revalidatePath(`/subscribers/${subscriberId}`);
  revalidatePath("/subscribers");
  revalidatePath("/dashboard");
  return { message: "success" };
}
