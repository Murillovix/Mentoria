import Link from "next/link";
import { NewWorkoutPlanForm } from "./form";

export default async function NewWorkoutPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-lg">
      <Link
        href={`/dashboard/students/${id}`}
        className="mb-4 inline-block text-sm text-black/60 underline underline-offset-2 dark:text-white/60"
      >
        ← Voltar
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Novo plano de treino</h1>
      <NewWorkoutPlanForm studentId={id} />
    </div>
  );
}
