import { auth }     from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role }     from "../../lib/generated/prisma/client";
import { Sidebar }  from "@/components/layout/sidebar";
import { Topbar }   from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      <Sidebar
        userRole={session.user.role  as Role}
        userName={session.user.name  ?? "Utilizador"}
        userEmail={session.user.email ?? ""}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <Topbar title="Dashboard" />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>

      </div>
    </div>
  );
}