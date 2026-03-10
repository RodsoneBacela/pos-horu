import { auth }    from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth(roles?: string[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (roles && roles.length > 0) {
    if (!roles.includes(session.user.role)) {
      redirect("/?erro=sem-permissao");
    }
  }

  return session;
}