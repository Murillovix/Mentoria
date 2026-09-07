import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireProfessional() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    redirect("/login");
  }
  return session.user;
}

export async function requireStudent() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }
  return session.user;
}
