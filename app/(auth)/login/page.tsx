import { auth }      from "@/lib/auth";
import { redirect }  from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Login — HoruPOS" };

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [bg-size:20px_20px] opacity-60" />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              𓂀
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">
                Horu<span className="text-blue-600">POS</span>
              </div>
              <div className="text-xs text-gray-400 font-mono tracking-wider">
                SISTEMA DE GESTÃO
              </div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Inicie sessão para aceder ao sistema
          </p>

          <LoginForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          HoruPOS © {new Date().getFullYear()} — Sistema Multiusos de Gestão
        </p>
      </div>
    </div>
  );
}