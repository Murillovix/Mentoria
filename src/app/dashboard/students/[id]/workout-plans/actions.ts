"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";

function toNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : Math.trunc(parsed);
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
  const plan = await prisma.workoutPlan.findUnique({
    where: { id: planId },
    include: { student: { select: { id: true, professionalId: true } } },
  });
  if (!plan || plan.student.professionalId !== professionalId) {
    throw new Error("Plano não encontrado.");
  }
  return plan;
}

async function getDayForOwner(dayId: string, professionalId: string) {
  const day = await prisma.workoutDay.findUnique({
    where: { id: dayId },
    include: {
      workoutPlan: {
        include: { student: { select: { id: true, professionalId: true } } },
      },
    },
  });
  if (!day || day.workoutPlan.student.professionalId !== professionalId) {
    throw new Error("Dia de treino não encontrado.");
  }
  return day;
}

async function getExerciseForOwner(exerciseId: string, professionalId: string) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      workoutDay: {
        include: {
          workoutPlan: {
            include: {
              student: { select: { id: true, professionalId: true } },
            },
          },
        },
      },
    },
  });
  if (
    !exercise ||
    exercise.workoutDay.workoutPlan.student.professionalId !== professionalId
  ) {
    throw new Error("Exercício não encontrado.");
  }
  return exercise;
}

export async function createWorkoutPlan(
  studentId: string,
  _prevState: string | undefined,
  formData: FormData
) {
  const professional = await requireProfessional();
  await assertOwnsStudent(studentId, professional.id);

  const title = toText(formData.get("title"));
  if (!title) return "Informe um título para o plano.";

  const plan = await prisma.workoutPlan.create({
    data: { studentId, title },
  });

  revalidatePath(`/dashboard/students/${studentId}`);
  redirect(`/dashboard/students/${studentId}/workout-plans/${plan.id}`);
}

export async function updateWorkoutPlanMeta(
  planId: string,
  formData: FormData
) {
  const professional = await requireProfessional();
  const plan = await getPlanForOwner(planId, professional.id);

  const title = toText(formData.get("title")) ?? plan.title;
  const notes = toText(formData.get("notes"));

  await prisma.workoutPlan.update({
    where: { id: planId },
    data: { title, notes },
  });

  revalidatePath(
    `/dashboard/students/${plan.studentId}/workout-plans/${planId}`
  );
}

export async function toggleWorkoutPlanActive(planId: string) {
  const professional = await requireProfessional();
  const plan = await getPlanForOwner(planId, professional.id);

  await prisma.workoutPlan.update({
    where: { id: planId },
    data: { active: !plan.active },
  });

  revalidatePath(`/dashboard/students/${plan.studentId}`);
  revalidatePath(
    `/dashboard/students/${plan.studentId}/workout-plans/${planId}`
  );
}

export async function deleteWorkoutPlan(planId: string) {
  const professional = await requireProfessional();
  const plan = await getPlanForOwner(planId, professional.id);

  await prisma.workoutPlan.delete({ where: { id: planId } });

  revalidatePath(`/dashboard/students/${plan.studentId}`);
  redirect(`/dashboard/students/${plan.studentId}`);
}

export async function createWorkoutDay(planId: string, formData: FormData) {
  const professional = await requireProfessional();
  const plan = await getPlanForOwner(planId, professional.id);

  const name = toText(formData.get("name"));
  if (!name) return;

  const count = await prisma.workoutDay.count({
    where: { workoutPlanId: planId },
  });

  await prisma.workoutDay.create({
    data: { workoutPlanId: planId, name, order: count },
  });

  revalidatePath(
    `/dashboard/students/${plan.studentId}/workout-plans/${planId}`
  );
}

export async function updateWorkoutDay(dayId: string, formData: FormData) {
  const professional = await requireProfessional();
  const day = await getDayForOwner(dayId, professional.id);

  const name = toText(formData.get("name")) ?? day.name;

  await prisma.workoutDay.update({
    where: { id: dayId },
    data: { name },
  });

  revalidatePath(
    `/dashboard/students/${day.workoutPlan.studentId}/workout-plans/${day.workoutPlanId}`
  );
}

export async function deleteWorkoutDay(dayId: string) {
  const professional = await requireProfessional();
  const day = await getDayForOwner(dayId, professional.id);

  await prisma.workoutDay.delete({ where: { id: dayId } });

  revalidatePath(
    `/dashboard/students/${day.workoutPlan.studentId}/workout-plans/${day.workoutPlanId}`
  );
}

export async function createExercise(dayId: string, formData: FormData) {
  const professional = await requireProfessional();
  const day = await getDayForOwner(dayId, professional.id);

  const name = toText(formData.get("name"));
  if (!name) return;

  const count = await prisma.exercise.count({ where: { workoutDayId: dayId } });

  await prisma.exercise.create({
    data: {
      workoutDayId: dayId,
      name,
      sets: toNumber(formData.get("sets")),
      reps: toText(formData.get("reps")),
      restSeconds: toNumber(formData.get("restSeconds")),
      weight: toText(formData.get("weight")),
      notes: toText(formData.get("notes")),
      order: count,
    },
  });

  revalidatePath(
    `/dashboard/students/${day.workoutPlan.studentId}/workout-plans/${day.workoutPlanId}`
  );
}

export async function updateExercise(exerciseId: string, formData: FormData) {
  const professional = await requireProfessional();
  const exercise = await getExerciseForOwner(exerciseId, professional.id);

  const name = toText(formData.get("name")) ?? exercise.name;

  await prisma.exercise.update({
    where: { id: exerciseId },
    data: {
      name,
      sets: toNumber(formData.get("sets")),
      reps: toText(formData.get("reps")),
      restSeconds: toNumber(formData.get("restSeconds")),
      weight: toText(formData.get("weight")),
      notes: toText(formData.get("notes")),
    },
  });

  revalidatePath(
    `/dashboard/students/${exercise.workoutDay.workoutPlan.studentId}/workout-plans/${exercise.workoutDay.workoutPlanId}`
  );
}

export async function deleteExercise(exerciseId: string) {
  const professional = await requireProfessional();
  const exercise = await getExerciseForOwner(exerciseId, professional.id);

  await prisma.exercise.delete({ where: { id: exerciseId } });

  revalidatePath(
    `/dashboard/students/${exercise.workoutDay.workoutPlan.studentId}/workout-plans/${exercise.workoutDay.workoutPlanId}`
  );
}
