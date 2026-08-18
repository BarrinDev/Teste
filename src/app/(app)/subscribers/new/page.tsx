import { SubscriberCreateForm } from "@/components/SubscriberCreateForm";

export default function NewSubscriberPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-100">Novo assinante</h1>
      <SubscriberCreateForm />
    </div>
  );
}
