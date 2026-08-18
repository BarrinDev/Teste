import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-100">{title}</h1>
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 px-6 py-16 text-center">
        <Icon size={28} className="text-zinc-600" />
        <p className="text-sm font-medium text-zinc-400">Em breve</p>
        <p className="max-w-sm text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
