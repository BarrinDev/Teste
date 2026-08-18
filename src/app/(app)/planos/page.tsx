import { prisma } from "@/lib/prisma";
import { PLAN_LABEL } from "@/lib/status";
import { PLAN_VALUES } from "@/lib/validations";

export const dynamic = "force-dynamic";

export default async function PlanosPage() {
  const now = new Date();

  const counts = await Promise.all(
    PLAN_VALUES.map(async (plan) => {
      const [total, ativos] = await Promise.all([
        prisma.subscriber.count({ where: { plan } }),
        prisma.subscriber.count({ where: { plan, cancelled: false, expiresAt: { gte: now } } }),
      ]);
      return { plan, total, ativos };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-100">Planos</h1>
      <p className="text-sm text-zinc-500">
        Planos disponíveis para o grupo VIP e quantos assinantes estão em cada um.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map(({ plan, total, ativos }) => (
          <div key={plan} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm font-semibold text-zinc-100">{PLAN_LABEL[plan]}</p>
            <p className="mt-3 text-2xl font-semibold text-yellow-400">{ativos}</p>
            <p className="text-xs text-zinc-500">ativos de {total} no total</p>
          </div>
        ))}
      </div>
    </div>
  );
}
