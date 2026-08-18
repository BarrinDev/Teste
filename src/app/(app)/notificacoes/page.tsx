import { Bell } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function NotificacoesPage() {
  return (
    <ComingSoon
      icon={Bell}
      title="Notificações"
      description="Central de notificações (ex: avisos automáticos de expiração). Ainda não faz parte do escopo atual."
    />
  );
}
