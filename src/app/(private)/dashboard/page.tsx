"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { Users, Send } from "lucide-react";
import { WhatsAppSidebar } from "@/components/whatsapp-sidebar";
import { useUser } from "@/contexts/userContext";
import { WhatsappSessionCard } from "@/components/WhatsappSessionCard";
import * as XLSX from "xlsx";
import { StatusCard } from "@/components/dashboard-cards/status-card";
import UploadCard from "@/components/dashboard-cards/upload-card";
import SendMessageCard from "@/components/dashboard-cards/send-message-card";
import { type ConnectionStatus, type StatusData } from "@/interfaces/status-connection";
import { toast } from "sonner"

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [globalStatus, setGlobalStatus] = useState<StatusData | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();

      const file = e.dataTransfer?.files?.[0];
      if (file) {
        setFile(file);
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  const createCampaign = async () => {
    if (!campaignName.trim() || !file || !message.trim()) {
      toast.error("Por favor, preencha todos os campos: Nome, Lista e Mensagem.");
      return;
    }
    setIsSending(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const contacts = rawData
        .map((row: unknown[]) => {
            const nome = String(row[0] || "");
            const numero = String(row[1] || "").replace(/\D/g, "");
            if (nome && numero.length >= 10) {
                return { nome, numero };
            }
            return null;
        })
        .filter((contact): contact is { nome: string; numero: string } => contact !== null);

      if (contacts.length === 0) {
        toast.error("Nenhum contato válido (com nome e número) encontrado na planilha.");
        setIsSending(false);
        return;
      }

      const payload = {
        name: campaignName,
        message: message,
        contacts: contacts,
        numsession: user?.id,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(`Campanha "${campaignName}" criada com sucesso!`, {
          description: `${contacts.length} contatos foram enfileirados para envio.`,
        });
        setFile(null);
        setMessage("");
        setCampaignName("");
      } else {
        const result = await response.json();
        toast.error(`Erro ao criar campanha: ${result.message}`);
      }
    } catch (err) {
      toast.error("Erro ao ler a planilha ou conectar ao servidor.");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };
  const handleCancelSend = async () => {
    if (!user?.id) return;
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fila/${user.id}/purge`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        toast.success('Campanha cancelada com sucesso.');
      } else {
        throw new Error('Falha ao enviar comando de cancelamento.');
      }
      
    } catch (error) {
      toast.error('Erro ao tentar cancelar a campanha.');
      console.error(error);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <WhatsAppSidebar />
        <div className="flex flex-col flex-1 overflow-auto bg-background w-screen">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-6">
              <h1 className="text-xl font-semibold">
                {user ? `Olá, ${user.name}!` : "Carregando..."}
              </h1>
            </div>
          </header>

          <main className="container mx-auto p-4 md:p-6 flex-1 overflow-auto">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard onStatusChange={setGlobalStatus} />
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Mensagens Enviadas
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                     Em breve
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Números Inválidos
                    </CardTitle>
                    <Send className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      Em breve
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Conectar WhatsApp */}
                {user?.email && user?.id ? (
                  <WhatsappSessionCard
                    sessionName={user.email}
                    numsession={String(user.id)}
                    initialStatus={
                      (globalStatus?.session?.[user.email] ||
                        "disconnected") as ConnectionStatus
                    }
                  />
                ) : null}

                {/* Upload de Contatos */}
                <UploadCard file={file} onFileSelect={setFile} />

                {/* Mensagem e Envio */}
                <SendMessageCard
                  message={message}
                  onMessageChange={setMessage}
                  campaignName={campaignName}
                  onCampaignNameChange={setCampaignName}
                  onSend={createCampaign}
                  onCancel={handleCancelSend}
                  isFileSelected={!!file}
                  isSending={isSending}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  );
};
