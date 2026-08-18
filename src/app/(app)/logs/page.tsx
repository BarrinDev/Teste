import { ScrollText } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function LogsPage() {
  return (
    <ComingSoon
      icon={ScrollText}
      title="Logs"
      description="Histórico de ações dos administradores (quem cadastrou, editou ou excluiu o quê). Ainda não faz parte do escopo atual."
    />
  );
}
