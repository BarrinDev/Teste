import { STATUS_BADGE_CLASS, STATUS_LABEL, type SubscriberStatus } from "@/lib/status";

export function StatusBadge({ status }: { status: SubscriberStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_BADGE_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
