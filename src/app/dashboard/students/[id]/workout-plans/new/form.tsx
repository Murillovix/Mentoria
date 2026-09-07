"use client";

import { useActionState } from "react";
import { createWorkoutPlan } from "../actions";

export function NewWorkoutPlanForm({ studentId }: { studentId: string }) {
  const action = createWorkoutPlan.bind(null, studentId);
  const [errorMessage, formAction, isPending] = useActionState(
    action,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="Ex: Treino ABC - Hipertrofia"
          className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        {isPending ? "Criando..." : "Criar plano"}
      </button>
    </form>
  );
}
