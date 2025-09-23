// components/dashboard-cards/sent-message-status-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type SentMessageStatusCardProps = {
  title: string;
  value: number | undefined;
  icon: ReactNode;
};

export function SentMessageStatusCard({ title, value, icon }: SentMessageStatusCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold h-7">
          {typeof value === 'number' ? (
            value.toLocaleString('pt-BR')
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}