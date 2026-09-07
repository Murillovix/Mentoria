import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user.role === "PROFESSIONAL") redirect("/dashboard");
  if (session?.user.role === "STUDENT") redirect("/portal");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Mentoria</h1>
        <p className="mt-4 text-black/70 dark:text-white/70">
          Gerencie planos alimentares e de treino dos seus alunos e
          pacientes, tudo em um só lugar.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          Entrar
        </Link>
      </div>
    </main>
  );
}
