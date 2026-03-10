"use client";

import { useState, useTransition } from "react";
import { useForm }                 from "react-hook-form";
import { zodResolver }             from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations/auth.schema";
import { loginAction }             from "@/actions/auth.actions";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [isPending,    startTransition]  = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(data);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <span>⚠</span> {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Email ou Username
        </label>
        <input
          {...register("identifier")}
          type="text"
          placeholder="admin ou admin@horupos.com"
          autoComplete="username"
          disabled={isPending}
          className={`
            w-full h-10 px-3 rounded-lg border text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
            ${errors.identifier
              ? "border-red-300 focus:ring-red-400"
              : "border-gray-200"}
          `}
        />
        {errors.identifier && (
          <p className="text-xs text-red-500">{errors.identifier.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="A tua password"
            autoComplete="current-password"
            disabled={isPending}
            className={`
              w-full h-10 px-3 pr-10 rounded-lg border text-sm bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
              ${errors.password
                ? "border-red-300 focus:ring-red-400"
                : "border-gray-200"}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword
              ? <EyeOff className="w-4 h-4" />
              : <Eye     className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="
          w-full h-11 mt-2 rounded-lg bg-blue-600 text-white font-semibold text-sm
          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2 transition-all
        "
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> A verificar...</>
        ) : (
          <><LogIn className="w-4 h-4" /> Entrar no Sistema</>
        )}
      </button>

      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center mb-2">
          Credenciais de demonstração
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Admin",   id: "admin",    pw: "admin123"  },
            { label: "Gerente", id: "gerente",  pw: "admin123"  },
            { label: "Caixa",   id: "caixa1",   pw: "admin123"  },
          ].map(({ label, id }) => (
            <button
              key={id}
              type="button"
              className="text-xs py-1.5 px-2 rounded-md border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all font-mono"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}