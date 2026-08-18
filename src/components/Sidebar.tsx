"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  ScrollText,
  Share2,
  Tag,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/lib/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subscribers", label: "Assinantes", icon: Users },
  { href: "/planos", label: "Planos", icon: Tag },
  { href: "/indicacoes", label: "Indicações", icon: Share2 },
  { href: "/suporte", label: "Suporte", icon: LifeBuoy },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
  { href: "/logs", label: "Logs", icon: ScrollText },
];

export function Sidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-zinc-500 hover:text-zinc-100 md:hidden"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 px-3 py-4">
          <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
            <span className="truncate text-sm text-zinc-400">{adminName}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 leading-tight">
      <Image src="/logo.png" alt="Sigma Métodos VIP" width={32} height={32} className="shrink-0" />
      <div>
        <p className="text-sm font-bold tracking-wide text-yellow-400">SIGMA MÉTODOS VIP</p>
        <p className="text-xs text-zinc-500">Admin Panel</p>
      </div>
    </div>
  );
}
