export const inputClass =
  "mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-yellow-500 focus:outline-none";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300">{label}</label>
      {children}
      {error?.[0] && <p className="mt-1 text-xs text-red-400">{error[0]}</p>}
    </div>
  );
}
