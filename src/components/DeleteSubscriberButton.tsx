"use client";

import { deleteSubscriber } from "@/lib/actions";

export function DeleteSubscriberButton({ subscriberId, name }: { subscriberId: string; name: string }) {
  const action = deleteSubscriber.bind(null, subscriberId);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Excluir ${name}? Essa ação não pode ser desfeita.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm font-medium text-red-400 hover:underline">
        Excluir assinante
      </button>
    </form>
  );
}
