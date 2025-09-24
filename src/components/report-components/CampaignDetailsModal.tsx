import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CampaignWithStats } from "./CampaignsTable";

interface CampaignDetailsModalProps {
  campaign: CampaignWithStats | null;
  onClose: () => void;
}

export function CampaignDetailsModal({
  campaign,
  onClose,
}: CampaignDetailsModalProps) {
  if (!campaign) return null;

  const getSuccessRate = (sent: number, total: number) => {
    if (!total || total === 0) return "0.0";
    return ((sent / total) * 100).toFixed(1);
  };

  return (
    <Dialog open={!!campaign} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Campanha: {campaign.name}</DialogTitle>
          <DialogDescription>
            Informações completas sobre a campanha selecionada
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Informações Gerais</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Agendada:</span>
                  <span>
                    {format(
                      new Date(campaign.scheduledAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Início do Envio:
                  </span>
                  <span>
                    {campaign.startedAt
                      ? format(
                          new Date(campaign.startedAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )
                      : "Aguardando"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fim do Envio:</span>
                  <span>
                    {campaign.finishedAt
                      ? format(
                          new Date(campaign.finishedAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )
                      : "Em andamento ou agendada"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Estatísticas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total de Contatos:
                  </span>
                  <span className="font-medium">
                    {campaign.totalContacts.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Mensagens Enviadas:
                  </span>
                  <span className="font-medium text-green-600">
                    {campaign.sentMessages.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Números Inválidos:
                  </span>
                  <span className="font-medium text-red-600">
                    {campaign.invalidNumbers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Taxa de Sucesso:
                  </span>
                  <span className="font-medium">
                    {getSuccessRate(
                      campaign.sentMessages,
                      campaign.totalContacts
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Mensagem Enviada</h4>
            <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
              {campaign.message}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
