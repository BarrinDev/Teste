"use client";

import { useActionState } from "react";
import { createSubscriber } from "@/lib/actions";
import { PLAN_LABEL } from "@/lib/status";
import { PLAN_VALUES } from "@/lib/validations";
import { Field, inputClass } from "@/components/form";

export function SubscriberCreateForm() {
  const [state, formAction, pending] = useActionState(createSubscriber, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <Field label="Nome" error={state?.errors?.name}>
        <input name="name" type="text" required className={inputClass} />
      </Field>

      <Field label="Contato (WhatsApp ou @usuário)" error={state?.errors?.contact}>
        <input name="contact" type="text" required className={inputClass} />
      </Field>

      <Field label="Plano" error={state?.errors?.plan}>
        <select name="plan" required defaultValue="MENSAL" className={inputClass}>
          {PLAN_VALUES.map((p) => (
            <option key={p} value={p}>
              {PLAN_LABEL[p]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Início" error={state?.errors?.startDate}>
          <input name="startDate" type="date" lang="pt-BR" required className={inputClass} />
        </Field>
        <Field label="Expira em" error={state?.errors?.expiresAt}>
          <input name="expiresAt" type="date" lang="pt-BR" required className={inputClass} />
        </Field>
      </div>

      <Field label="Valor pago (R$)" error={state?.errors?.amount}>
        <input name="amount" type="text" inputMode="decimal" placeholder="0,00" required className={inputClass} />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-400 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Cadastrar assinante"}
      </button>
    </form>
  );
}
