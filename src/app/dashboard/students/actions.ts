"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";

const studentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  goal: z.string().optional(),
  notes: z.string().optional(),
});

function parseBirthDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function assertOwnsStudent(studentId: string, professionalId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { professionalId: true },
  });
  if (!student || student.professionalId !== professionalId) {
    throw new Error("Aluno não encontrado.");
  }
}

export async function createStudent(
  _prevState: string | undefined,
  formData: FormData
) {
  const professional = await requireProfessional();

  const parsed = studentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birthDate: formData.get("birthDate"),
    goal: formData.get("goal"),
    notes: formData.get("notes"),
  });

  const password = formData.get("password");
  if (typeof password !== "string" || password.length < 6) {
    return "A senha inicial deve ter pelo menos 6 caracteres.";
  }

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Dados inválidos.";
  }

  const { name, email, phone, birthDate, goal, notes } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return "Já existe uma conta com este e-mail.";
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const student = await prisma.student.create({
    data: {
      professional: { connect: { id: professional.id } },
      phone: phone || null,
      birthDate: parseBirthDate(birthDate),
      goal: goal || null,
      notes: notes || null,
      user: {
        create: {
          name,
          email,
          passwordHash,
          role: Role.STUDENT,
        },
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/students/${student.id}`);
}

export async function updateStudent(
  studentId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  const professional = await requireProfessional();
  await assertOwnsStudent(studentId, professional.id);

  const parsed = studentSchema
    .omit({ email: true })
    .safeParse({
      name: formData.get("name"),
      phone: formData.get("phone"),
      birthDate: formData.get("birthDate"),
      goal: formData.get("goal"),
      notes: formData.get("notes"),
    });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Dados inválidos.";
  }

  const { name, phone, birthDate, goal, notes } = parsed.data;

  await prisma.student.update({
    where: { id: studentId },
    data: {
      phone: phone || null,
      birthDate: parseBirthDate(birthDate),
      goal: goal || null,
      notes: notes || null,
      user: { update: { name } },
    },
  });

  revalidatePath(`/dashboard/students/${studentId}`);
  redirect(`/dashboard/students/${studentId}`);
}

export async function resetStudentPassword(
  studentId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  const professional = await requireProfessional();
  await assertOwnsStudent(studentId, professional.id);

  const password = formData.get("password");
  if (typeof password !== "string" || password.length < 6) {
    return "A nova senha deve ter pelo menos 6 caracteres.";
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const student = await prisma.student.findUniqueOrThrow({
    where: { id: studentId },
    select: { userId: true },
  });

  await prisma.user.update({
    where: { id: student.userId },
    data: { passwordHash },
  });

  return "Senha atualizada com sucesso.";
}

export async function toggleStudentActive(studentId: string) {
  const professional = await requireProfessional();
  await assertOwnsStudent(studentId, professional.id);

  const student = await prisma.student.findUniqueOrThrow({
    where: { id: studentId },
    select: { active: true },
  });

  await prisma.student.update({
    where: { id: studentId },
    data: { active: !student.active },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/students/${studentId}`);
}

export async function deleteStudent(studentId: string) {
  const professional = await requireProfessional();
  await assertOwnsStudent(studentId, professional.id);

  const student = await prisma.student.findUniqueOrThrow({
    where: { id: studentId },
    select: { userId: true },
  });

  await prisma.user.delete({ where: { id: student.userId } });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
