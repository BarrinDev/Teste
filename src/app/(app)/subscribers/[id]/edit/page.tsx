import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubscriberEditForm } from "@/components/SubscriberEditForm";

export const dynamic = "force-dynamic";

export default async function EditSubscriberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const subscriber = await prisma.subscriber.findUnique({ where: { id } });
  if (!subscriber) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-100">Editar {subscriber.name}</h1>
      <SubscriberEditForm
        subscriberId={subscriber.id}
        defaultValues={{
          name: subscriber.name,
          contact: subscriber.contact,
          plan: subscriber.plan,
          startDate: subscriber.startDate.toISOString().slice(0, 10),
          expiresAt: subscriber.expiresAt.toISOString().slice(0, 10),
          cancelled: subscriber.cancelled,
        }}
      />
    </div>
  );
}
