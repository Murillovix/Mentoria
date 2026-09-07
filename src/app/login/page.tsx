import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-black/10 p-8 dark:border-white/15">
        <h1 className="mb-1 text-xl font-semibold">Entrar</h1>
        <p className="mb-6 text-sm text-black/60 dark:text-white/60">
          Acesse sua conta de profissional ou aluno.
        </p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-black/60 dark:text-white/60">
          <Link href="/" className="underline underline-offset-2">
            Voltar para a página inicial
          </Link>
        </p>
      </div>
    </main>
  );
}
