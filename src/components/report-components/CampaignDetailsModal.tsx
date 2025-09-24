import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy, Clock, CheckCircle2, Send, Users, X, CircleX } from "lucide-react";
import { CampaignWithStats } from "@/components/report-components/CampaignsTable";
import { useMemo } from "react";
import { StatusBadge, type CampaignStatus } from "@/components/report-components/StatusBadge";

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

  const campaignStatus: CampaignStatus =
    (campaign as any).cancelledAt
      ? "CANCELLED"
      : campaign.finishedAt
      ? "COMPLETED"
      : campaign.startedAt
      ? "RUNNING"
      : "SCHEDULED";

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(campaign.message ?? "");
    } catch {}
  };

  return (
    <Dialog open={!!campaign} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="sticky top-0 z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {campaign.name}
              </DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground">
                Informações consolidadas da campanha
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="shadow-sm rounded-md">
                <StatusBadge status={campaignStatus} />
              </div>
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

        <div className="px-6 py-6 bg-gradient-to-br from-background to-muted/40">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border shadow-md hover:shadow-lg transition py-0">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-t-lg pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-700">
                <Users className="h-4 w-4" /> Total de contatos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-4">
              {campaign.totalContacts.toLocaleString()}
            </CardContent>
          </Card>

            <Card className="border shadow-md hover:shadow-lg transition py-0">
              <CardHeader className="pb-2 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-t-lg pt-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-700">
                  <Send className="h-4 w-4" /> Enviadas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-3xl font-extrabold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                {campaign.sentMessages.toLocaleString()}
              </CardContent>
            </Card>

            <Card className="border shadow-md hover:shadow-lg transition py-0">
              <CardHeader className="pb-2 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-t-lg pt-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700">
                  <CircleX className="h-4 w-4" /> Inválidos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-3xl font-extrabold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                {campaign.invalidNumbers.toLocaleString?.() ?? campaign.invalidNumbers}
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          {/* Conteúdo detalhado */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline */}
            <Card className="lg:col-span-1 border border-muted-foreground/10 hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Linha do tempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Início do envio</div>
                    <div className="text-sm font-medium">{campaign.startedAt ? f(campaign.startedAt) : "Aguardando"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Fim do envio</div>
                    <div className="text-sm font-medium">{campaign.finishedAt ? f(campaign.finishedAt) : "Em andamento ou agendada"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="lg:col-span-1 border border-muted-foreground/10 hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Taxa de sucesso</span>
                  <span className="font-semibold text-green-600">{successRate}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Entregas / Total</span>
                  <span className="font-semibold text-blue-600">
                    {campaign.sentMessages.toLocaleString()} / {campaign.totalContacts.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Números inválidos</span>
                  <span className="font-semibold text-red-600">
                    {campaign.invalidNumbers.toLocaleString?.() ?? campaign.invalidNumbers}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Mensagem */}
            <Card className="lg:col-span-1 border border-muted-foreground/10 hover:shadow-md transition">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Mensagem enviada</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyMessage}
                        aria-label="Copiar mensagem"
                        className="p-1 h-6 w-6"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-56 rounded-md border bg-muted/30">
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
