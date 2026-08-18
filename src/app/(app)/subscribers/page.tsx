import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { StatusBadge } from "@/components/StatusBadge";
import {
  formatDate,
  getSubscriberStatus,
  PLAN_LABEL,
  STATUS_ROW_CLASS,
} from "@/lib/status";

export const dynamic = "force-dynamic";

type StatusFilter = "todos" | "ativo" | "expira_em_breve" | "expirado" | "cancelado";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "expira_em_breve", label: "Expira em breve" },
  { value: "expirado", label: "Expirados" },
  { value: "cancelado", label: "Cancelados" },
];

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = (params.status as StatusFilter) ?? "todos";
  const sort = params.sort === "desc" ? "desc" : "asc";

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const where: Prisma.SubscriberWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { contact: { contains: q, mode: "insensitive" } },
    ];
  }

  if (status === "ativo") {
    where.cancelled = false;
    where.expiresAt = { gte: now };
  } else if (status === "expira_em_breve") {
    where.cancelled = false;
    where.expiresAt = { gte: now, lte: in7Days };
  } else if (status === "expirado") {
    where.cancelled = false;
    where.expiresAt = { lt: now };
  } else if (status === "cancelado") {
    where.cancelled = true;
  }

  const subscribers = await prisma.subscriber.findMany({
    where,
    orderBy: { expiresAt: sort },
  });

  const nextSort = sort === "asc" ? "desc" : "asc";
  const baseParams = new URLSearchParams({ ...(q ? { q } : {}), ...(status !== "todos" ? { status } : {}) });
  const sortHref = `/subscribers?${new URLSearchParams({ ...Object.fromEntries(baseParams), sort: nextSort })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-100">Assinantes</h1>
        <Link
          href="/subscribers/new"
          className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-400"
        >
          + Novo assinante
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="q" className="block text-xs font-medium text-zinc-500">
            Buscar por nome ou contato
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-zinc-500">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="mt-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-yellow-500 focus:outline-none"
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950/50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">
                <Link href={sortHref} className="flex items-center gap-1 hover:text-zinc-100">
                  Expira em {sort === "asc" ? "▲" : "▼"}
                </Link>
              </th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {subscribers.map((s) => {
              const st = getSubscriberStatus(s.expiresAt, s.cancelled, now);
              return (
                <tr key={s.id} className={STATUS_ROW_CLASS[st]}>
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    <Link href={`/subscribers/${s.id}`} className="hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{s.contact}</td>
                  <td className="px-4 py-3 text-zinc-400">{PLAN_LABEL[s.plan]}</td>
                  <td className="px-4 py-3 text-zinc-400">{formatDate(s.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={st} />
                  </td>
                </tr>
              );
            })}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Nenhum assinante encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
