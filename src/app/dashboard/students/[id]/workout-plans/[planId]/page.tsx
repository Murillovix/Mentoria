import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import {
  createExercise,
  createWorkoutDay,
  deleteExercise,
  deleteWorkoutDay,
  deleteWorkoutPlan,
  toggleWorkoutPlanActive,
  updateExercise,
  updateWorkoutDay,
  updateWorkoutPlanMeta,
} from "../actions";

const inputClass =
  "rounded-md border border-black/10 px-2 py-1 text-sm outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40";
const exerciseGridClass =
  "grid flex-1 grid-cols-2 gap-2 sm:grid-cols-[2fr_60px_80px_80px_100px_1.5fr_auto] sm:items-center";

export default async function WorkoutPlanPage({
  params,
}: {
  params: Promise<{ id: string; planId: string }>;
}) {
  const professional = await requireProfessional();
  const { id: studentId, planId } = await params;

  const plan = await prisma.workoutPlan.findUnique({
    where: { id: planId },
    include: {
      student: { include: { user: true } },
      days: {
        orderBy: { order: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (
    !plan ||
    plan.studentId !== studentId ||
    plan.student.professionalId !== professional.id
  ) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/dashboard/students/${studentId}`}
          className="mb-4 inline-block text-sm text-black/60 underline underline-offset-2 dark:text-white/60"
        >
          ← Voltar para {plan.student.user.name}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <form
            action={updateWorkoutPlanMeta.bind(null, planId)}
            className="flex min-w-[240px] flex-1 flex-col gap-2"
          >
            <input
              name="title"
              defaultValue={plan.title}
              className="border-b border-transparent bg-transparent text-2xl font-semibold outline-none focus:border-black/20 dark:focus:border-white/30"
            />
            <textarea
              name="notes"
              defaultValue={plan.notes ?? ""}
              placeholder="Observações do plano"
              rows={2}
              className={inputClass}
            />
            <button
              type="submit"
              className="w-fit text-sm underline underline-offset-2"
            >
              Salvar título/observações
            </button>
          </form>

          <div className="flex flex-col items-end gap-2">
            <form action={toggleWorkoutPlanActive.bind(null, planId)}>
              <button
                type="submit"
                className="text-sm underline underline-offset-2"
              >
                {plan.active ? "Marcar inativo" : "Marcar ativo"}
              </button>
            </form>
            <form action={deleteWorkoutPlan.bind(null, planId)}>
              <button
                type="submit"
                className="text-sm text-red-600 underline underline-offset-2 dark:text-red-400"
              >
                Excluir plano
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {plan.days.map((day) => (
          <div
            key={day.id}
            className="rounded-lg border border-black/10 dark:border-white/15"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/15">
              <form
                action={updateWorkoutDay.bind(null, day.id)}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  name="name"
                  defaultValue={day.name}
                  className="border-b border-transparent bg-transparent font-medium outline-none focus:border-black/20 dark:focus:border-white/30"
                />
                <button
                  type="submit"
                  className="text-xs underline underline-offset-2"
                >
                  Salvar
                </button>
              </form>
              <form action={deleteWorkoutDay.bind(null, day.id)}>
                <button
                  type="submit"
                  className="text-xs text-red-600 underline underline-offset-2 dark:text-red-400"
                >
                  Excluir dia
                </button>
              </form>
            </div>

            <div className="hidden gap-2 border-b border-black/5 px-4 py-2 text-xs font-medium text-black/50 sm:grid sm:grid-cols-[2fr_60px_80px_80px_100px_1.5fr_auto] dark:border-white/10 dark:text-white/50">
              <span>Exercício</span>
              <span>Séries</span>
              <span>Reps</span>
              <span>Desc. (s)</span>
              <span>Carga</span>
              <span>Observações</span>
              <span />
            </div>

            <div className="flex flex-col">
              {day.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex flex-col gap-2 border-t border-black/5 px-4 py-2 sm:flex-row sm:items-center dark:border-white/10"
                >
                  <form
                    action={updateExercise.bind(null, exercise.id)}
                    className={exerciseGridClass}
                  >
                    <input
                      name="name"
                      defaultValue={exercise.name}
                      className={`${inputClass} col-span-2 sm:col-span-1`}
                    />
                    <input
                      name="sets"
                      type="number"
                      defaultValue={exercise.sets ?? ""}
                      className={inputClass}
                    />
                    <input
                      name="reps"
                      placeholder="8-12"
                      defaultValue={exercise.reps ?? ""}
                      className={inputClass}
                    />
                    <input
                      name="restSeconds"
                      type="number"
                      defaultValue={exercise.restSeconds ?? ""}
                      className={inputClass}
                    />
                    <input
                      name="weight"
                      placeholder="Ex: 20kg"
                      defaultValue={exercise.weight ?? ""}
                      className={inputClass}
                    />
                    <input
                      name="notes"
                      defaultValue={exercise.notes ?? ""}
                      className={`${inputClass} col-span-2 sm:col-span-1`}
                    />
                    <button
                      type="submit"
                      className="w-fit text-xs underline underline-offset-2"
                    >
                      Salvar
                    </button>
                  </form>
                  <form action={deleteExercise.bind(null, exercise.id)}>
                    <button
                      type="submit"
                      className="text-xs text-red-600 underline underline-offset-2 dark:text-red-400"
                    >
                      Excluir
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <form
              action={createExercise.bind(null, day.id)}
              className="flex flex-col gap-2 border-t border-black/10 px-4 py-3 sm:flex-row sm:items-center dark:border-white/15"
            >
              <div className={exerciseGridClass}>
                <input
                  name="name"
                  placeholder="Exercício"
                  required
                  className={`${inputClass} col-span-2 sm:col-span-1`}
                />
                <input
                  name="sets"
                  type="number"
                  placeholder="Séries"
                  className={inputClass}
                />
                <input name="reps" placeholder="Reps" className={inputClass} />
                <input
                  name="restSeconds"
                  type="number"
                  placeholder="Desc. (s)"
                  className={inputClass}
                />
                <input
                  name="weight"
                  placeholder="Carga"
                  className={inputClass}
                />
                <input
                  name="notes"
                  placeholder="Observações"
                  className={`${inputClass} col-span-2 sm:col-span-1`}
                />
                <button
                  type="submit"
                  className="w-fit text-xs font-medium underline underline-offset-2"
                >
                  + Adicionar
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>

      <form
        action={createWorkoutDay.bind(null, planId)}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-black/20 p-4 dark:border-white/20"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Novo dia de treino</label>
          <input
            name="name"
            required
            placeholder="Ex: Treino A - Peito/Tríceps"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          Adicionar dia
        </button>
      </form>
    </div>
  );
}
