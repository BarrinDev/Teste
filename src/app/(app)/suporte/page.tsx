import { LifeBuoy } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function SuportePage() {
  return (
    <ComingSoon
      icon={LifeBuoy}
      title="Suporte"
      description="Central de tickets de suporte para assinantes. Ainda não faz parte do escopo atual."
    />
  );
}
