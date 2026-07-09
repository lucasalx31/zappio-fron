"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WhatsAppSidebar } from "@/components/whatsapp-sidebar";
import { useUser } from "@/contexts/userContext";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import { DateFilters } from "./report-components/DateFilters";
import { StatsCards } from "./report-components/StatsCards";
import {
  CampaignsTable,
  CampaignWithStats,
} from "./report-components/CampaignsTable";
import { PaginationControls } from "./report-components/PaginationControls";
import { CampaignDetailsModal } from "./report-components/CampaignDetailsModal";
import { NGROK_SKIP_HEADER } from "@/lib/api/http";

// Função fetcher para o SWR
const fetcher = (url: string) =>
  fetch(url, { headers: { ...NGROK_SKIP_HEADER } }).then((res) => {
    if (!res.ok) {
      throw new Error("Falha ao buscar os dados.");
    }
    return res.json();
  });

export function ReportsPage() {
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignWithStats | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const { user } = useUser();

  const apiUrl = user?.id
    ? new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${user.id}`)
    : null;
  if (apiUrl) {
    if (startDate)
      apiUrl.searchParams.set("startDate", startDate.toISOString());
    if (endDate) apiUrl.searchParams.set("endDate", endDate.toISOString());
  }

  const {
    data: campaigns,
    error,
    isLoading,
  } = useSWR<CampaignWithStats[]>(apiUrl ? apiUrl.toString() : null, fetcher, {
    keepPreviousData: true,
  });

  // Lógica de paginação
  const paginatedData = useMemo(() => {
    if (!campaigns)
      return { paginatedCampaigns: [], totalPages: 0, totalItems: 0 };

    const totalItems = campaigns.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCampaigns = campaigns.slice(startIndex, endIndex);

    return { paginatedCampaigns, totalPages, totalItems };
  }, [campaigns, currentPage, itemsPerPage]);

  // Reset para primeira página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  useEffect(() => {
    if (error && campaigns) {
      toast.error("Falha ao atualizar os relatórios.", {
        description: "Mostrando a última versão carregada com sucesso.",
      });
    }
  }, [error, campaigns]);

  // Funções de filtro de data
  const setPresetDates = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start);
    setEndDate(end);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Funções de paginação
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < paginatedData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Função para download de campanha
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const downloadCampaign = (c: CampaignWithStats) => {
    const headers = [
      "Campanha",
      "Status",
      "Data Agendada",
      "Total Contatos",
      "Enviadas",
      "Inválidos",
      "Taxa Sucesso (%)",
      "Mensagem",
    ];
    const row = [
      c.name,
      c.status,
      new Date(c.scheduledAt).toLocaleString("pt-BR"),
      c.totalContacts,
      c.sentMessages,
      c.invalidNumbers,
      getSuccessRate(c.sentMessages, c.totalContacts),
      c.message,
    ];
    const csvEscape = (val: string | number | null | undefined) =>
      `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csv =
      "sep=,\n" +
      headers.map(csvEscape).join(",") +
      "\n" +
      row.map(csvEscape).join(",").replace(/\n/g, "\\n") +
      "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${slugify(c.name)}-${
      new Date(c.scheduledAt).toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSuccessRate = (sent: number, total: number) => {
    if (!total || total === 0) return "0.0";
    return ((sent / total) * 100).toFixed(1);
  };

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!campaigns) {
      return {
        totalCampaigns: 0,
        totalSentMessages: 0,
        totalInvalidNumbers: 0,
      };
    }

    return {
      totalCampaigns: campaigns.length,
      totalSentMessages: campaigns.reduce((acc, c) => acc + c.sentMessages, 0),
      totalInvalidNumbers: campaigns.reduce(
        (acc, c) => acc + c.invalidNumbers,
        0
      ),
    };
  }, [campaigns]);

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <WhatsAppSidebar />
        <div className="flex flex-col flex-1 bg-background w-screen overflow-auto">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-6">
              <h1 className="text-xl font-semibold">Relatórios de Campanhas</h1>
              <div className="flex items-center gap-3 justify-end">
                <DateFilters
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onPresetDates={setPresetDates}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4 md:p-6 flex-1">
            <div className="flex flex-col gap-6">
              <StatsCards stats={stats} />

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Campanhas</CardTitle>
                  <CardDescription>
                    Visualize todas as campanhas enviadas e suas estatísticas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[335px]">
                    <CampaignsTable
                      campaigns={paginatedData.paginatedCampaigns}
                      isLoading={isLoading}
                      error={!!error && !campaigns}
                      onViewDetails={setSelectedCampaign}
                      onDownloadCampaign={downloadCampaign}
                    />
                  </div>

                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={paginatedData.totalPages}
                    totalItems={paginatedData.totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                    onPreviousPage={goToPreviousPage}
                    onNextPage={goToNextPage}
                  />
                </CardContent>
              </Card>

              <CampaignDetailsModal
                campaign={selectedCampaign}
                onClose={() => setSelectedCampaign(null)}
              />
            </div>
          </main>
        </div>
      </div>
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  );
}
