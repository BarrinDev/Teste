export type SubscriberStatus = "ATIVO" | "EXPIRA_EM_BREVE" | "EXPIRADO" | "CANCELADO";

const SOON_WINDOW_DAYS = 7;

export function getSubscriberStatus(
  expiresAt: Date,
  cancelled: boolean,
  now: Date = new Date()
): SubscriberStatus {
  if (cancelled) return "CANCELADO";
  if (expiresAt.getTime() < now.getTime()) return "EXPIRADO";

  const soonThreshold = new Date(now);
  soonThreshold.setDate(soonThreshold.getDate() + SOON_WINDOW_DAYS);
  if (expiresAt.getTime() <= soonThreshold.getTime()) return "EXPIRA_EM_BREVE";

  return "ATIVO";
}

export const STATUS_LABEL: Record<SubscriberStatus, string> = {
  ATIVO: "Ativo",
  EXPIRA_EM_BREVE: "Expira em breve",
  EXPIRADO: "Expirado",
  CANCELADO: "Cancelado",
};

export const STATUS_BADGE_CLASS: Record<SubscriberStatus, string> = {
  ATIVO: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
  EXPIRA_EM_BREVE: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  EXPIRADO: "bg-red-500/10 text-red-400 ring-red-500/30",
  CANCELADO: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/30",
};

export const STATUS_ROW_CLASS: Record<SubscriberStatus, string> = {
  ATIVO: "",
  EXPIRA_EM_BREVE: "bg-amber-500/5",
  EXPIRADO: "bg-red-500/5",
  CANCELADO: "",
};

export const PLAN_LABEL: Record<string, string> = {
  MENSAL: "Mensal",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual",
};

export function formatCurrencyCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}
