import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { AddPaymentForm } from "@/components/AddPaymentForm";
import { DeleteSubscriberButton } from "@/components/DeleteSubscriberButton";
import { formatCurrencyCents, formatDate, getSubscriberStatus, PLAN_LABEL } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function SubscriberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const subscriber = await prisma.subscriber.findUnique({
    where: { id },
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });

  if (!subscriber) notFound();

  const status = getSubscriberStatus(subscriber.expiresAt, subscriber.cancelled);
  const totalPaidCents = subscriber.payments.reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{subscriber.name}</h1>
          <p className="text-sm text-zinc-500">{subscriber.contact}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/subscribers/${subscriber.id}/edit`}
            className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Editar
          </Link>
          <DeleteSubscriberButton subscriberId={subscriber.id} name={subscriber.name} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard label="Status" value={<StatusBadge status={status} />} />
        <InfoCard label="Plano" value={PLAN_LABEL[subscriber.plan]} />
        <InfoCard label="Início" value={formatDate(subscriber.startDate)} />
        <InfoCard label="Expira em" value={formatDate(subscriber.expiresAt)} />
      </div>

      <InfoCard label="Total pago (histórico)" value={formatCurrencyCents(totalPaidCents)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AddPaymentForm subscriberId={subscriber.id} currentPlan={subscriber.plan} />

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Histórico de pagamentos</h2>
          {subscriber.payments.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum pagamento registrado.</p>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {subscriber.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-zinc-100">{formatCurrencyCents(p.amountCents)}</p>
                    <p className="text-xs text-zinc-500">{PLAN_LABEL[p.plan]}</p>
                  </div>
                  <span className="text-zinc-500">{formatDate(p.paidAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <div className="mt-1 text-base font-semibold text-zinc-100">{value}</div>
    </div>
  );
}
