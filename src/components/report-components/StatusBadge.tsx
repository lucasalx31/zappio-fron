import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Clock, Ban } from "lucide-react";

export type CampaignStatus = "SCHEDULED" | "RUNNING" | "COMPLETED" | "CANCELLED";

interface StatusBadgeProps {
  status: CampaignStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusMap = {
    COMPLETED: {
      text: "Finalizada",
      icon: <Check className="w-3 h-3 mr-1" />,
      variant: "default" as const,
      className: "flex items-center justify-center bg-green-600 hover:bg-green-700",
    },
    RUNNING: {
      text: "Em Andamento",
      icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />,
      variant: "default" as const,
      className: "flex items-center justify-center bg-blue-600 hover:bg-blue-700",
    },
    SCHEDULED: {
      text: "Agendada",
      icon: <Clock className="w-3 h-3 mr-1" />,
      variant: "secondary" as const,
      className: "flex items-center justify-center",
    },
    CANCELLED: {
      text: "Cancelada",
      icon: <Ban className="w-3 h-3 mr-1" />,
      variant: "destructive" as const,
      className: "flex items-center justify-center",
    },
  };

  const { text, icon, variant, className } =
    statusMap[status] || statusMap.SCHEDULED;

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {text}
    </Badge>
  );
}
