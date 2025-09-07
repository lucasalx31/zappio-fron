"use client";

import type React from "react";
import type { SessionWhatsapp } from "@/interfaces/session";
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
  const [sessions] = useState<SessionWhatsapp[]>([]);
  const [globalStatus, setGlobalStatus] = useState<StatusData | null>(null);
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

  const sendMessages = async () => {
    if (!file || !message.trim()) {
      alert("Por favor, selecione um arquivo e digite uma mensagem");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const mensagens = rawData.map((row: unknown[]) => {
          const nome = String(row[0]);
          const numeroOriginal = String(row[1]);
          const numeroLimpo = numeroOriginal.replace(/\D/g, "");
          if (nome && numeroLimpo) {
            return { nome, numero: numeroLimpo, mensagem: message };
          }
          return null;
        }).filter(Boolean);

      if (mensagens.length === 0) {
        alert("Nenhum contato válido encontrado na planilha.");
        return;
      }

      const payload = { numsession: user?.id, mensagens };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(`${mensagens.length} mensagens enviadas para a fila com sucesso!`);
      } else {
        const result = await response.json();
        toast.error(`Erro: ${result.message}`);
      }
    } catch (error) {
      toast.error("Erro ao ler a planilha ou conectar ao servidor.");
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
                    <div className="text-2xl font-bold">
                      {
                        sessions.filter(
                          (s) =>
                            (s.connectionStatus?.status || s.status) ===
                            "connected"
                        ).length
                      }
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
                    <div className="text-2xl font-bold">
                      {
                        sessions.filter((s) =>
                          ["disconnected", "error", "failed"].includes(
                            s.connectionStatus?.status || s.status
                          )
                        ).length
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  onSend={sendMessages}
                  onCancel={handleCancelSend}
                  isFileSelected={!!file}
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
