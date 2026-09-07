import Link from "next/link";
import { requireProfessional } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireProfessional();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/15">
        <Link href="/dashboard" className="font-semibold">
          Mentoria
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-black/60 dark:text-white/60">
            {user.name}
          </span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
