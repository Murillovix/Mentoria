import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { deleteStudent, toggleStudentActive } from "../actions";
import { ResetPasswordForm } from "./reset-password-form";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const professional = await requireProfessional();
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      mealPlans: { orderBy: { createdAt: "desc" } },
      workoutPlans: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student || student.professionalId !== professional.id) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-block text-sm text-black/60 underline underline-offset-2 dark:text-white/60"
        >
          ← Voltar
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{student.user.name}</h1>
            <p className="text-black/60 dark:text-white/60">
              {student.user.email}
            </p>
            {student.phone && (
              <p className="text-sm text-black/60 dark:text-white/60">
                {student.phone}
              </p>
            )}
            {student.goal && (
              <p className="mt-2 text-sm">
                <span className="font-medium">Objetivo:</span> {student.goal}
              </p>
            )}
            {student.notes && (
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {student.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-3 text-sm">
              <Link
                href={`/dashboard/students/${student.id}/edit`}
                className="underline underline-offset-2"
              >
                Editar dados
              </Link>
              <form
                action={async () => {
                  "use server";
                  await toggleStudentActive(student.id);
                }}
              >
                <button type="submit" className="underline underline-offset-2">
                  {student.active ? "Marcar inativo" : "Marcar ativo"}
                </button>
              </form>
            </div>
            <form
              action={async () => {
                "use server";
                await deleteStudent(student.id);
              }}
            >
              <button
                type="submit"
                className="text-sm text-red-600 underline underline-offset-2 dark:text-red-400"
              >
                Excluir aluno
              </button>
            </form>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Planos alimentares</h2>
          <Link
            href={`/dashboard/students/${student.id}/meal-plans/new`}
            className="text-sm underline underline-offset-2"
          >
            + Novo plano alimentar
          </Link>
        </div>
        {student.mealPlans.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">
            Nenhum plano alimentar cadastrado.
          </p>
        ) : (
          <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/15 dark:border-white/15">
            {student.mealPlans.map((plan) => (
              <li key={plan.id}>
                <Link
                  href={`/dashboard/students/${student.id}/meal-plans/${plan.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
                >
                  <span>{plan.title}</span>
                  {plan.active && (
                    <span className="rounded-full bg-green-600/10 px-2 py-1 text-xs text-green-700 dark:text-green-400">
                      Ativo
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Planos de treino</h2>
          <Link
            href={`/dashboard/students/${student.id}/workout-plans/new`}
            className="text-sm underline underline-offset-2"
          >
            + Novo plano de treino
          </Link>
        </div>
        {student.workoutPlans.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">
            Nenhum plano de treino cadastrado.
          </p>
        ) : (
          <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/15 dark:border-white/15">
            {student.workoutPlans.map((plan) => (
              <li key={plan.id}>
                <Link
                  href={`/dashboard/students/${student.id}/workout-plans/${plan.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
                >
                  <span>{plan.title}</span>
                  {plan.active && (
                    <span className="rounded-full bg-green-600/10 px-2 py-1 text-xs text-green-700 dark:text-green-400">
                      Ativo
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Senha de acesso</h2>
        <ResetPasswordForm studentId={student.id} />
      </section>
    </div>
  );
}
