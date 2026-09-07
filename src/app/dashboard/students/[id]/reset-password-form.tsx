"use client";

import { useActionState } from "react";
import { resetStudentPassword } from "../actions";

export function ResetPasswordForm({ studentId }: { studentId: string }) {
  const action = resetStudentPassword.bind(null, studentId);
  const [message, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-sm items-end gap-3">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
          className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/[0.03] disabled:opacity-60 dark:border-white/15 dark:hover:bg-white/[0.06]"
      >
        {isPending ? "Salvando..." : "Redefinir"}
      </button>
      {message && (
        <p className="text-sm text-black/60 dark:text-white/60">{message}</p>
      )}
    </form>
  );
}
