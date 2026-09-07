"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";

function toNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
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

async function getPlanForOwner(planId: string, professionalId: string) {
  const plan = await prisma.mealPlan.findUnique({
    where: { id: planId },
    include: { student: { select: { id: true, professionalId: true } } },
  });
  if (!plan || plan.student.professionalId !== professionalId) {
    throw new Error("Plano não encontrado.");
  }
  return plan;
}

async function getMealForOwner(mealId: string, professionalId: string) {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: {
      mealPlan: {
        include: { student: { select: { id: true, professionalId: true } } },
      },
    },
  });
  if (!meal || meal.mealPlan.student.professionalId !== professionalId) {
    throw new Error("Refeição não encontrada.");
  }
  return meal;
}

async function getItemForOwner(itemId: string, professionalId: string) {
  const item = await prisma.mealItem.findUnique({
    where: { id: itemId },
    include: {
      meal: {
        include: {
          mealPlan: {
            include: {
              student: { select: { id: true, professionalId: true } },
            },
          },
        },
      },
    },
  });
  if (!item || item.meal.mealPlan.student.professionalId !== professionalId) {
    throw new Error("Item não encontrado.");
  }
  return item;
}

export async function createMealPlan(
  studentId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  const professional = await requireProfessional();
  await assertOwnsStudent(studentId, professional.id);

  const title = toText(formData.get("title"));
  if (!title) return "Informe um título para o plano.";

  const plan = await prisma.mealPlan.create({
    data: { studentId, title },
  });

  revalidatePath(`/dashboard/students/${studentId}`);
  redirect(`/dashboard/students/${studentId}/meal-plans/${plan.id}`);
}

export async function updateMealPlanMeta(planId: string, formData: FormData) {
  const professional = await requireProfessional();
  const plan = await getPlanForOwner(planId, professional.id);

  const title = toText(formData.get("title")) ?? plan.title;
  const notes = toText(formData.get("notes"));

  await prisma.mealPlan.update({
    where: { id: planId },
    data: { title, notes },
  });

  revalidatePath(
    `/dashboard/students/${plan.studentId}/meal-plans/${planId}`
  );
}

export async function toggleMealPlanActive(planId: string) {
  const professional = await requireProfessional();
  const plan = await getPlanForOwner(planId, professional.id);

  await prisma.mealPlan.update({
    where: { id: planId },
    data: { active: !plan.active },
  });

  revalidatePath(`/dashboard/students/${plan.studentId}`);
  revalidatePath(
    `/dashboard/students/${plan.studentId}/meal-plans/${planId}`
  );
}

export async function deleteMealPlan(planId: string) {
  const professional = await requireProfessional();
  const plan = await getPlanForOwner(planId, professional.id);

  await prisma.mealPlan.delete({ where: { id: planId } });

  revalidatePath(`/dashboard/students/${plan.studentId}`);
  redirect(`/dashboard/students/${plan.studentId}`);
}

export async function createMeal(planId: string, formData: FormData) {
  const professional = await requireProfessional();
  const plan = await getPlanForOwner(planId, professional.id);

  const name = toText(formData.get("name"));
  if (!name) return;

  const time = toText(formData.get("time"));

  const count = await prisma.meal.count({ where: { mealPlanId: planId } });

  await prisma.meal.create({
    data: { mealPlanId: planId, name, time, order: count },
  });

  revalidatePath(
    `/dashboard/students/${plan.studentId}/meal-plans/${planId}`
  );
}

export async function updateMeal(mealId: string, formData: FormData) {
  const professional = await requireProfessional();
  const meal = await getMealForOwner(mealId, professional.id);

  const name = toText(formData.get("name")) ?? meal.name;
  const time = toText(formData.get("time"));

  await prisma.meal.update({
    where: { id: mealId },
    data: { name, time },
  });

  revalidatePath(
    `/dashboard/students/${meal.mealPlan.studentId}/meal-plans/${meal.mealPlanId}`
  );
}

export async function deleteMeal(mealId: string) {
  const professional = await requireProfessional();
  const meal = await getMealForOwner(mealId, professional.id);

  await prisma.meal.delete({ where: { id: mealId } });

  revalidatePath(
    `/dashboard/students/${meal.mealPlan.studentId}/meal-plans/${meal.mealPlanId}`
  );
}

export async function createMealItem(mealId: string, formData: FormData) {
  const professional = await requireProfessional();
  const meal = await getMealForOwner(mealId, professional.id);

  const foodName = toText(formData.get("foodName"));
  if (!foodName) return;

  const count = await prisma.mealItem.count({ where: { mealId } });

  await prisma.mealItem.create({
    data: {
      mealId,
      foodName,
      quantity: toNumber(formData.get("quantity")),
      unit: toText(formData.get("unit")),
      calories: toNumber(formData.get("calories")),
      protein: toNumber(formData.get("protein")),
      carbs: toNumber(formData.get("carbs")),
      fat: toNumber(formData.get("fat")),
      order: count,
    },
  });

  revalidatePath(
    `/dashboard/students/${meal.mealPlan.studentId}/meal-plans/${meal.mealPlanId}`
  );
}

export async function updateMealItem(itemId: string, formData: FormData) {
  const professional = await requireProfessional();
  const item = await getItemForOwner(itemId, professional.id);

  const foodName = toText(formData.get("foodName")) ?? item.foodName;

  await prisma.mealItem.update({
    where: { id: itemId },
    data: {
      foodName,
      quantity: toNumber(formData.get("quantity")),
      unit: toText(formData.get("unit")),
      calories: toNumber(formData.get("calories")),
      protein: toNumber(formData.get("protein")),
      carbs: toNumber(formData.get("carbs")),
      fat: toNumber(formData.get("fat")),
    },
  });

  revalidatePath(
    `/dashboard/students/${item.meal.mealPlan.studentId}/meal-plans/${item.meal.mealPlanId}`
  );
}

export async function deleteMealItem(itemId: string) {
  const professional = await requireProfessional();
  const item = await getItemForOwner(itemId, professional.id);

  await prisma.mealItem.delete({ where: { id: itemId } });

  revalidatePath(
    `/dashboard/students/${item.meal.mealPlan.studentId}/meal-plans/${item.meal.mealPlanId}`
  );
}
