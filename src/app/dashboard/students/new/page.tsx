import Link from "next/link";
import { NewStudentForm } from "./student-form";

export default function NewStudentPage() {
  return (
    <div className="max-w-lg">
      <Link
        href="/dashboard"
        className="mb-4 inline-block text-sm text-black/60 underline underline-offset-2 dark:text-white/60"
      >
        ← Voltar
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Novo aluno</h1>
      <NewStudentForm />
    </div>
  );
}
