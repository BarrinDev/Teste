"use client";

import { useActionState, useEffect, useRef } from "react";
import { addPayment } from "@/lib/actions";
import { PLAN_LABEL } from "@/lib/status";
import { PLAN_VALUES } from "@/lib/validations";
import { Field, inputClass } from "@/components/form";

export function AddPaymentForm({ subscriberId, currentPlan }: { subscriberId: string; currentPlan: string }) {
  const addPaymentWithId = addPayment.bind(null, subscriberId);
  const [state, formAction, pending] = useActionState(addPaymentWithId, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.message === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-sm font-semibold text-zinc-300">Registrar pagamento / renovação</h2>

      <Field label="Valor pago (R$)" error={state?.errors?.amount}>
        <input name="amount" type="text" inputMode="decimal" placeholder="0,00" required className={inputClass} />
      </Field>

      <Field label="Plano" error={state?.errors?.plan}>
        <select name="plan" required defaultValue={currentPlan} className={inputClass}>
          {PLAN_VALUES.map((p) => (
            <option key={p} value={p}>
              {PLAN_LABEL[p]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Data do pagamento" error={state?.errors?.paidAt}>
          <input name="paidAt" type="date" lang="pt-BR" defaultValue={today} required className={inputClass} />
        </Field>
        <Field label="Nova data de expiração" error={state?.errors?.newExpiresAt}>
          <input name="newExpiresAt" type="date" lang="pt-BR" required className={inputClass} />
        </Field>
      </div>

      {state?.message === "success" && <p className="text-sm text-emerald-400">Pagamento registrado.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-400 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Registrar pagamento"}
      </button>
    </form>
  );
}
