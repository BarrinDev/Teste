"use client";

import { useActionState } from "react";
import { updateSubscriber } from "@/lib/actions";
import { PLAN_LABEL } from "@/lib/status";
import { PLAN_VALUES } from "@/lib/validations";
import { Field, inputClass } from "@/components/form";

type Props = {
  subscriberId: string;
  defaultValues: {
    name: string;
    contact: string;
    plan: string;
    startDate: string;
    expiresAt: string;
    cancelled: boolean;
  };
};

export function SubscriberEditForm({ subscriberId, defaultValues }: Props) {
  const updateWithId = updateSubscriber.bind(null, subscriberId);
  const [state, formAction, pending] = useActionState(updateWithId, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <Field label="Nome" error={state?.errors?.name}>
        <input name="name" type="text" defaultValue={defaultValues.name} required className={inputClass} />
      </Field>

      <Field label="Contato (WhatsApp ou @usuário)" error={state?.errors?.contact}>
        <input name="contact" type="text" defaultValue={defaultValues.contact} required className={inputClass} />
      </Field>

      <Field label="Plano" error={state?.errors?.plan}>
        <select name="plan" required defaultValue={defaultValues.plan} className={inputClass}>
          {PLAN_VALUES.map((p) => (
            <option key={p} value={p}>
              {PLAN_LABEL[p]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Início" error={state?.errors?.startDate}>
          <input name="startDate" type="date" lang="pt-BR" defaultValue={defaultValues.startDate} required className={inputClass} />
        </Field>
        <Field label="Expira em" error={state?.errors?.expiresAt}>
          <input name="expiresAt" type="date" lang="pt-BR" defaultValue={defaultValues.expiresAt} required className={inputClass} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="cancelled"
          type="checkbox"
          defaultChecked={defaultValues.cancelled}
          className="rounded border-zinc-700 bg-zinc-950 text-yellow-500 focus:ring-yellow-500"
        />
        Assinatura cancelada
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-400 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
