import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrencyCents, formatDate } from "@/lib/status";
import { RevenueChart } from "@/components/RevenueChart";

export const dynamic = "force-dynamic";

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" }).format(date);
}

export default async function DashboardPage() {
  const session = await auth();
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  const [ativos, expirados, totalRevenue, monthRevenue, expiringSoon, recentPayments] = await Promise.all([
    prisma.subscriber.count({ where: { cancelled: false, expiresAt: { gte: now } } }),
    prisma.subscriber.count({ where: { cancelled: false, expiresAt: { lt: now } } }),
    prisma.payment.aggregate({ _sum: { amountCents: true } }),
    prisma.payment.aggregate({
      _sum: { amountCents: true },
      where: { paidAt: { gte: startOfMonth, lt: startOfNextMonth } },
    }),
    prisma.subscriber.findMany({
      where: { cancelled: false, expiresAt: { gte: now, lte: in7Days } },
      orderBy: { expiresAt: "asc" },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: sixMonthsAgo } },
      select: { amountCents: true, paidAt: true },
    }),
  ]);

  const monthBuckets = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    monthBuckets.set(monthKey(d), 0);
  }
  for (const payment of recentPayments) {
    const key = monthKey(payment.paidAt);
    if (monthBuckets.has(key)) {
      monthBuckets.set(key, monthBuckets.get(key)! + payment.amountCents);
    }
  }
  const chartData = Array.from(monthBuckets.entries()).map(([key, cents]) => {
    const [year, month] = key.split("-").map(Number);
    return {
      month: monthLabel(new Date(Date.UTC(year, month - 1, 1))),
      receita: cents / 100,
    };
  });

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-yellow-950/40 via-zinc-900 to-zinc-950 px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Painel Sigma Métodos VIP</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-50">
          Bem-vindo de volta, {session?.user?.name} 👋
        </h1>
        <p className="mt-1 max-w-xl text-sm text-zinc-400">
          Aqui está o resumo das assinaturas do grupo VIP — métricas, receita e quem precisa de atenção, tudo em um
          lugar só.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Assinantes ativos" value={String(ativos)} accent="text-emerald-400" />
        <MetricCard label="Assinantes expirados" value={String(expirados)} accent="text-red-400" />
        <MetricCard
          label="Receita total"
          value={formatCurrencyCents(totalRevenue._sum.amountCents ?? 0)}
          accent="text-amber-400"
        />
        <MetricCard
          label="Receita do mês"
          value={formatCurrencyCents(monthRevenue._sum.amountCents ?? 0)}
          accent="text-sky-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Receita por mês (últimos 6 meses)</h2>
          <RevenueChart data={chartData} />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Expiram nos próximos 7 dias</h2>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-zinc-500">Ninguém expira nos próximos 7 dias.</p>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {expiringSoon.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/subscribers/${s.id}`} className="font-medium text-zinc-100 hover:underline">
                    {s.name}
                  </Link>
                  <span className="text-amber-400">{formatDate(s.expiresAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
