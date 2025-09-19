"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import useSWR from 'swr'
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { WhatsAppSidebar } from "@/components/whatsapp-sidebar"
import { Calendar, AlertTriangle, CheckCircle, Eye, Download, CalendarIcon, X, Loader2, Clock, Ban, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/contexts/userContext"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Toaster } from "./ui/sonner"

// 1. Define o tipo de dados que virão da nossa API
type CampaignWithStats = {
  id: string;
  name: string;
  message: string;
  status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  totalContacts: number;
  sentMessages: number;
  invalidNumbers: number;
}

// 2. Cria uma função "fetcher" que o SWR usará para buscar os dados
const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Falha ao buscar os dados.');
    }
    return res.json();
});

// Componente para renderizar o status com cores e ícones
const StatusBadge = ({ status }: { status: CampaignWithStats['status'] }) => {
    const statusMap = {
        COMPLETED: { text: "Finalizada", icon: <Check className="w-3 h-3 mr-1" />, variant: "default", className: "bg-green-600 hover:bg-green-700" },
        RUNNING: { text: "Em Andamento", icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />, variant: "default", className: "bg-blue-600 hover:bg-blue-700" },
        SCHEDULED: { text: "Agendada", icon: <Clock className="w-3 h-3 mr-1" />, variant: "secondary", className: "" },
        CANCELLED: { text: "Cancelada", icon: <Ban className="w-3 h-3 mr-1" />, variant: "destructive", className: "" },
    } as const;
    const { text, icon, variant, className } = statusMap[status] || statusMap.SCHEDULED;
    return <Badge variant={variant} className={className}>{icon}{text}</Badge>
}

export function ReportsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithStats | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const { user } = useUser();

  const apiUrl = user?.id ? new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${user.id}`) : null;
  if(apiUrl) {
    if (startDate) apiUrl.searchParams.set('startDate', startDate.toISOString());
    if (endDate) apiUrl.searchParams.set('endDate', endDate.toISOString());
  }

  const { data: campaigns, error, isLoading } = useSWR<CampaignWithStats[]>(apiUrl ? apiUrl.toString() : null, fetcher, {
    keepPreviousData: true,
  });

  useEffect(() => {
    if (error && campaigns) {
      toast.error("Falha ao atualizar os relatórios.", {
        description: "Mostrando a última versão carregada com sucesso.",
      });
    }
  }, [error, campaigns]);

  const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const downloadCampaign = (c: CampaignWithStats) => {
    const headers = ["Campanha", "Status", "Data Agendada", "Total Contatos", "Enviadas", "Inválidos", "Taxa Sucesso (%)", "Mensagem"];
    const row = [c.name, c.status, format(new Date(c.scheduledAt), "dd/MM/yyyy HH:mm"), c.totalContacts, c.sentMessages, c.invalidNumbers, getSuccessRate(c.sentMessages, c.totalContacts), c.message];
    const csvEscape = (val: string | number | null | undefined) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csv = "sep=,\n" + headers.map(csvEscape).join(",") + "\n" + row.map(csvEscape).join(",").replace(/\n/g, "\\n") + "\n";
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${slugify(c.name)}-${format(new Date(c.scheduledAt), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  const getSuccessRate = (sent: number, total: number) => {
    if (!total || total === 0) return '0.0';
    return ((sent / total) * 100).toFixed(1);
  }

  const setPresetDates = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setStartDate(start)
    setEndDate(end)
  }

  const clearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <WhatsAppSidebar />
        <div className="flex flex-col flex-1 bg-background w-screen overflow-auto">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-6">
              <h1 className="text-xl font-semibold">Relatórios de Campanhas</h1>
              <div className="flex items-center gap-3 justify-end">
                <div className="flex items-center gap-2 rounded-lg">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !startDate && "text-muted-foreground")} size="sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Data inicial"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} disabled={(date) => (endDate ? date > endDate : false)} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <span className="text-sm text-muted-foreground">até</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !endDate && "text-muted-foreground")} size="sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Data final"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => (startDate ? date < startDate : false)} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center gap-1 ml-2 border-l pl-2">
                    <Button variant="ghost" size="sm" onClick={() => setPresetDates(7)} className="text-xs h-7 px-2">7d</Button>
                    <Button variant="ghost" size="sm" onClick={() => setPresetDates(30)} className="text-xs h-7 px-2">30d</Button>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7 px-1"><X className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4 md:p-6 flex-1">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{campaigns?.length ?? 0}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{campaigns?.reduce((acc, c) => acc + c.sentMessages, 0).toLocaleString() ?? 0}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Números Inválidos</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold">{campaigns?.reduce((acc, c) => acc + c.invalidNumbers, 0) ?? 0}</div></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                    <CardTitle>Histórico de Campanhas</CardTitle>
                    <CardDescription>Visualize todas as campanhas enviadas e suas estatísticas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Contatos</TableHead>
                        <TableHead>Enviadas</TableHead>
                        <TableHead>Inválidos</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              <span className="ml-2 text-muted-foreground">Carregando...</span>
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
                      {campaigns && campaigns.length > 0 ? (
                        campaigns.map((campaign) => (
                            <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell><StatusBadge status={campaign.status} /></TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(campaign.scheduledAt), "dd/MM/yy 'às' HH:mm")}
                                </div>
                            </TableCell>
                            <TableCell>{campaign.totalContacts.toLocaleString()}</TableCell>
                            <TableCell className="text-green-600 font-medium">{campaign.sentMessages.toLocaleString()}</TableCell>
                            <TableCell className="text-red-600 font-medium">{campaign.invalidNumbers}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedCampaign(campaign)} title="Ver detalhes"><Eye className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadCampaign(campaign)} title="Baixar CSV"><Download className="w-4 h-4" /></Button>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))
                      ) : (
                        !isLoading && <TableRow>
                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">Nenhuma campanha encontrada.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {selectedCampaign && (
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div>
                        <CardTitle>Detalhes da Campanha: {selectedCampaign.name}</CardTitle>
                        <CardDescription>Informações completas sobre a campanha selecionada</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedCampaign(null)} aria-label="Fechar detalhes" title="Fechar"><X className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Informações Gerais</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Data Agendada:</span>
                                <span>{format(new Date(selectedCampaign.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Início do Envio:</span>
                                <span>{selectedCampaign.startedAt ? format(new Date(selectedCampaign.startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Aguardando'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fim do Envio:</span>
                                <span>{selectedCampaign.finishedAt ? format(new Date(selectedCampaign.finishedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Em andamento ou agendada'}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Estatísticas</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total de Contatos:</span>
                                <span className="font-medium">{selectedCampaign.totalContacts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mensagens Enviadas:</span>
                                <span className="font-medium text-green-600">{selectedCampaign.sentMessages.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Números Inválidos:</span>
                                <span className="font-medium text-red-600">{selectedCampaign.invalidNumbers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Taxa de Sucesso:</span>
                                <span className="font-medium">{getSuccessRate(selectedCampaign.sentMessages, selectedCampaign.totalContacts)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Mensagem Enviada</h4>
                        <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">{selectedCampaign.message}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
      <Toaster richColors position="bottom-right"/>
    </SidebarProvider>
  )
}