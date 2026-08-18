import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <Sidebar adminName={session?.user?.name ?? ""} />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
