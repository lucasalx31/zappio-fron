import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy, Clock, CheckCircle2, Send, Users, XCircle, CalendarClock, X } from "lucide-react";
import { CampaignWithStats } from "./CampaignsTable";
import { useMemo } from "react";

interface CampaignDetailsModalProps {
  campaign: CampaignWithStats | null;
  onClose: () => void;
}

export function CampaignDetailsModal({ campaign, onClose }: CampaignDetailsModalProps) {
  if (!campaign) return null;

  const f = (d?: string | Date | null) =>
    d ? format(new Date(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—";

  const successRate = useMemo(() => {
    const total = campaign.totalContacts || 0;
    if (!total) return 0;
    return Math.min(100, Number(((campaign.sentMessages / total) * 100).toFixed(1)));
  }, [campaign.totalContacts, campaign.sentMessages]);

  const status:
    | { label: string; variant: "secondary" | "default" | "outline" | "destructive" }
    = campaign.finishedAt
      ? { label: "Concluída", variant: "secondary" }
      : campaign.startedAt
        ? { label: "Em andamento", variant: "default" }
        : { label: "Agendada", variant: "outline" };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(campaign.message ?? "");
    } catch {}
  };

  return (
    <Dialog open={!!campaign} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl tracking-tight">
                {campaign.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Informações consolidadas da campanha
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={status.variant} className="self-center">
                {status.label}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" /> Total de contatos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-2xl font-semibold">
                {campaign.totalContacts.toLocaleString()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Send className="h-4 w-4" /> Enviadas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold">
                  {campaign.sentMessages.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Inválidos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-2xl font-semibold">
                {campaign.invalidNumbers.toLocaleString?.() ?? campaign.invalidNumbers}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" /> Agendada para
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-base font-medium">
                {f(campaign.scheduledAt)}
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Linha do tempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Início do envio</div>
                    <div className="text-sm font-medium">{campaign.startedAt ? f(campaign.startedAt) : "Aguardando"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Fim do envio</div>
                    <div className="text-sm font-medium">{campaign.finishedAt ? f(campaign.finishedAt) : "Em andamento ou agendada"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Taxa de sucesso</span>
                  <span className="font-medium">{successRate}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Entregas/Total</span>
                  <span className="font-medium">
                    {campaign.sentMessages.toLocaleString()} / {campaign.totalContacts.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Números inválidos</span>
                  <span className="font-medium">
                    {campaign.invalidNumbers.toLocaleString?.() ?? campaign.invalidNumbers}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Mensagem enviada</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={copyMessage} aria-label="Copiar mensagem">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-56 rounded-md border">
                  <pre className="whitespace-pre-wrap p-4 text-sm leading-relaxed">
                    {campaign.message || "—"}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
