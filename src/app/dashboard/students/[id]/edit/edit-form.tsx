"use client";

import { useActionState } from "react";
import { updateStudent } from "../../actions";

type StudentDefaults = {
  name: string;
  phone: string;
  birthDate: string;
  goal: string;
  notes: string;
};

export function EditStudentForm({
  studentId,
  defaults,
}: {
  studentId: string;
  defaults: StudentDefaults;
}) {
  const action = updateStudent.bind(null, studentId);
  const [errorMessage, formAction, isPending] = useActionState(
    action,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" name="name" required defaultValue={defaults.name} />
        <Field
          label="Telefone"
          name="phone"
          defaultValue={defaults.phone}
        />
        <Field
          label="Data de nascimento"
          name="birthDate"
          type="date"
          defaultValue={defaults.birthDate}
        />
        <Field label="Objetivo" name="goal" defaultValue={defaults.goal} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaults.notes}
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
        {isPending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
      />
    </div>
  );
}
