"use client";

import Image from "next/image";
import { useActionState } from "react";
import { authenticate } from "@/lib/actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(authenticate, undefined);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <Image src="/logo.png" alt="Sigma Métodos VIP" width={80} height={80} className="mx-auto" priority />
        <h1 className="mt-4 text-center text-xl font-semibold text-zinc-100">Admin Panel</h1>
        <p className="mt-1 text-center text-sm text-zinc-500">Acesso restrito aos administradores.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-zinc-300">
              Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          {state?.message && (
            <p className="text-sm text-red-400" role="alert">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-400 disabled:opacity-60"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
