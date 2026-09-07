import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfessional } from "@/lib/session";
import { EditStudentForm } from "./edit-form";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const professional = await requireProfessional();
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!student || student.professionalId !== professional.id) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <Link
        href={`/dashboard/students/${student.id}`}
        className="mb-4 inline-block text-sm text-black/60 underline underline-offset-2 dark:text-white/60"
      >
        ← Voltar
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Editar aluno</h1>
      <EditStudentForm
        studentId={student.id}
        defaults={{
          name: student.user.name,
          phone: student.phone ?? "",
          birthDate: student.birthDate
            ? student.birthDate.toISOString().slice(0, 10)
            : "",
          goal: student.goal ?? "",
          notes: student.notes ?? "",
        }}
      />
    </div>
  );
}
