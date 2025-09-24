import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Eye, Download, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";

export interface CampaignWithStats {
  id: string;
  name: string;
  message: string;
  status: "SCHEDULED" | "RUNNING" | "COMPLETED" | "CANCELLED";
  scheduledAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  totalContacts: number;
  sentMessages: number;
  invalidNumbers: number;
}

interface CampaignsTableProps {
  campaigns: CampaignWithStats[];
  isLoading: boolean;
  error: boolean;
  onViewDetails: (campaign: CampaignWithStats) => void;
  onDownloadCampaign: (campaign: CampaignWithStats) => void;
}

export function CampaignsTable({
  campaigns,
  isLoading,
  error,
  onViewDetails,
  onDownloadCampaign,
}: CampaignsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campanha</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Contatos</TableHead>
          <TableHead>Enviadas</TableHead>
          <TableHead>Inválidos</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={7} className="text-center h-24">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  Carregando...
                </span>
              </div>
            </TableCell>
          </TableRow>
        )}
        {error && !campaigns && (
          <TableRow>
            <TableCell colSpan={7} className="text-center h-24 text-red-500">
              <div className="flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 mr-2" />
                <span>Falha ao carregar os dados.</span>
              </div>
            </TableCell>
          </TableRow>
        )}
        {campaigns && campaigns.length > 0
          ? campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium w-60 max-w-[240px] truncate">
                    {campaign.name}
                </TableCell>
                <TableCell className="w-60 max-w-[240px]">
                  <StatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="w-60 max-w-[240px]">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(
                      new Date(campaign.scheduledAt),
                      "dd/MM/yy 'às' HH:mm"
                    )}
                  </div>
                </TableCell>
                <TableCell>{campaign.totalContacts.toLocaleString()}</TableCell>
                <TableCell className="text-green-600 font-medium">
                  {campaign.sentMessages.toLocaleString()}
                </TableCell>
                <TableCell className="text-red-600 font-medium">
                  {campaign.invalidNumbers}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-start gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewDetails(campaign)}
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDownloadCampaign(campaign)}
                      title="Baixar CSV"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          : !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-24 text-muted-foreground"
                >
                  Nenhuma campanha encontrada.
                </TableCell>
              </TableRow>
            )}
      </TableBody>
    </Table>
  );
}
