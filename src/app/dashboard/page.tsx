import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";

export default async function DashboardPage() {
  const professional = await requireProfessional();

  const students = await prisma.student.findMany({
    where: { professionalId: professional.id },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Alunos e pacientes</h1>
        <Link
          href="/dashboard/students/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          Novo aluno
        </Link>
      </div>

      {students.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          Você ainda não cadastrou nenhum aluno.
        </p>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/15 dark:border-white/15">
          {students.map((student) => (
            <li key={student.id}>
              <Link
                href={`/dashboard/students/${student.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
              >
                <div>
                  <p className="font-medium">{student.user.name}</p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {student.user.email}
                  </p>
                </div>
                {!student.active && (
                  <span className="rounded-full bg-black/10 px-2 py-1 text-xs dark:bg-white/15">
                    Inativo
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
