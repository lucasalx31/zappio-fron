"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { WhatsAppSidebar } from "@/components/whatsapp-sidebar"
import { Calendar, AlertTriangle, CheckCircle, Eye, Download, CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data - substituir por dados reais do banco
const mockCampaigns = [
  {
    id: 1,
    name: "Campanha Black Friday",
    startDate: "2024-01-15",
    startTime: "09:00",
    endDate: "2024-01-15",
    endTime: "12:30",
    totalContacts: 1500,
    sentMessages: 1420,
    invalidNumbers: 80,
    message: "🔥 Black Friday chegou! Descontos de até 70% em todos os produtos. Não perca!",
  },
  {
    id: 2,
    name: "Promoção Natal",
    startDate: "2024-01-10",
    startTime: "14:00",
    endDate: "2024-01-10",
    endTime: "18:45",
    totalContacts: 850,
    sentMessages: 820,
    invalidNumbers: 30,
    message: "🎄 Natal especial! Presentes únicos com frete grátis. Confira já!",
  },
  {
    id: 3,
    name: "Lançamento Produto",
    startDate: "2024-01-08",
    startTime: "10:30",
    endDate: "2024-01-08",
    endTime: "11:15",
    totalContacts: 500,
    sentMessages: 485,
    invalidNumbers: 15,
    message: "🚀 Novo produto chegou! Seja um dos primeiros a conhecer nossa novidade.",
  },
]

export function ReportsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<(typeof mockCampaigns)[0] | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // ===== helpers para download por campanha =====
  const csvEscape = (val: string | number) => `"${String(val ?? "").replace(/"/g, '""')}"`
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

  const buildCampaignCSV = (c: (typeof mockCampaigns)[number]) => {
    const headers = [
      "Campanha",
      "Data Início",
      "Hora Início",
      "Data Fim",
      "Hora Fim",
      "Total Contatos",
      "Mensagens Enviadas",
      "Números Inválidos",
      "Status",
      "Mensagem",
    ]
    const row = [
      c.name,
      new Date(c.startDate).toLocaleDateString("pt-BR"),
      c.startTime,
      new Date(c.endDate).toLocaleDateString("pt-BR"),
      c.endTime,
      c.totalContacts,
      c.sentMessages,
      c.invalidNumbers,
      c.message,
    ]
    const csv =
      "sep=,\n" +
      headers.map(csvEscape).join(",") +
      "\n" +
      row.map(csvEscape).join(",") +
      "\n"
    return csv
  }

  const downloadCampaign = (c: (typeof mockCampaigns)[number]) => {
    const csv = buildCampaignCSV(c)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-${slugify(c.name)}-${c.startDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  // ==============================================

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    if (!startDate && !endDate) return true
    const campaignDate = new Date(campaign.startDate)
    if (startDate && endDate) {
      return campaignDate >= startDate && campaignDate <= endDate
    } else if (startDate) {
      return campaignDate >= startDate
    } else if (endDate) {
      return campaignDate <= endDate
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Concluída</Badge>
      case "running":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Em Andamento</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Falhou</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  const getSuccessRate = (sent: number, total: number) => ((sent / total) * 100).toFixed(1)

  const setPresetDates = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days + 1)
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
        <div className="flex flex-col flex-1  bg-background w-screen">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-6">
              <h1 className="text-xl font-semibold">Relatórios de Campanhas</h1>
              <div className="flex items-center gap-3 justify-end">
                <div className="flex items-center gap-2 rounded-lg">
                  {/* Data Inicial */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-[140px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                        size="sm"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Data inicial"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => (endDate ? date > endDate : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-sm text-muted-foreground">até</span>

                  {/* Data Final */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-[140px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                        size="sm"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Data final"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => (startDate ? date < startDate : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Botões de Preset */}
                  <div className="flex items-center gap-1 ml-2 border-l pl-2">
                    <Button variant="ghost" size="sm" onClick={() => setPresetDates(7)} className="text-xs h-7 px-2">
                      7d
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPresetDates(30)} className="text-xs h-7 px-2">
                      30d
                    </Button>

                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7 px-1">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4 md:p-6 flex-1 overflow-auto mt-6">
            <div className="flex flex-col gap-6">
              {/* Resumo Geral */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredCampaigns.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filteredCampaigns.reduce((acc, campaign) => acc + campaign.sentMessages, 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Números Inválidos</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filteredCampaigns.reduce((acc, campaign) => acc + campaign.invalidNumbers, 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Campanhas */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Campanhas</CardTitle>
                  <CardDescription>
                    {filteredCampaigns.length === mockCampaigns.length
                      ? "Visualize todas as campanhas enviadas e suas estatísticas"
                      : `Mostrando ${filteredCampaigns.length} de ${mockCampaigns.length} campanhas filtradas`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Contatos</TableHead>
                        <TableHead>Enviadas</TableHead>
                        <TableHead>Inválidos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>

                          {/* Data */}
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3" />
                              {new Date(campaign.startDate).toLocaleDateString("pt-BR")}
                            </div>
                          </TableCell>

                          {/* Hora */}
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              {campaign.startTime} - {campaign.endTime}
                            </div>
                          </TableCell>

                          <TableCell>{campaign.totalContacts.toLocaleString()}</TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {campaign.sentMessages.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-red-600 font-medium">{campaign.invalidNumbers}</TableCell>

                          {/* Ações */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCampaign(campaign)}
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadCampaign(campaign)}
                                title="Baixar CSV"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

             {/* Detalhes da Campanha Selecionada */}
             {selectedCampaign && (
                <Card>
                  <CardHeader className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle>Detalhes da Campanha: {selectedCampaign.name}</CardTitle>
                      <CardDescription>Informações completas sobre a campanha selecionada</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCampaign(null)}
                      aria-label="Fechar detalhes"
                      title="Fechar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Informações Gerais</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Data de Início:</span>
                              <span>
                                {new Date(selectedCampaign.startDate).toLocaleDateString("pt-BR")} às {selectedCampaign.startTime}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Data de Fim:</span>
                              <span>
                                {new Date(selectedCampaign.endDate).toLocaleDateString("pt-BR")} às {selectedCampaign.endTime}
                              </span>
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
                              <span className="font-medium">
                                {getSuccessRate(selectedCampaign.sentMessages, selectedCampaign.totalContacts)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Mensagem Enviada</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm">{selectedCampaign.message}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
