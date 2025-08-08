"use client";

import type React from "react";
import type { SessionWhatsapp } from "@/interfaces/session";
import type { UserData } from "@/interfaces/user";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import {
  Upload,
  MessageCircle,
  Users,
  Send,
  RefreshCw,
  Plus,
} from "lucide-react";
import { WhatsAppSidebar } from "@/components/whatsapp-sidebar";
import { useUser } from "@/contexts/userContext";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { createSession } from "@/lib/api/whatsapp/qrcode";
import { WhatsappSessionCard } from "@/components/WhatsappSessionCard";
import * as XLSX from "xlsx";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessions, setSessions] = useState<SessionWhatsapp[]>([]);
  const { user } = useUser();


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const sendMessages = async () => {
    if (!file || !message.trim()) {
      alert("Por favor, selecione um arquivo e digite uma mensagem");
      return;
    }

    setIsSending(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const numeros: string[] = rawData.flat().filter(Boolean);

      console.log("📋 Números lidos da planilha:", numeros);

      for (const numeroOriginal of numeros) {
        const numeroLimpo = String(numeroOriginal).replace(/\D/g, "");

        const numeroFormatado =
          numeroLimpo.length === 11
            ? `55${numeroLimpo}`
            : numeroLimpo.length >= 12 && numeroLimpo.length <= 13
            ? numeroLimpo
            : null;

        if (!numeroFormatado) {
          console.warn("⚠️ Número ignorado (inválido):", numeroOriginal);
          continue;
        }

        const payload = {
          numsession: user?.id, // Ajustar para pegar automaticamente
          numero: numeroFormatado,
          mensagem: message,
        };

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/enviar`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          const result = await response.json();

          if (response.ok) {
            console.log(`✅ Enviado para ${numeroFormatado}:`, result);
          } else {
            console.error(
              `❌ Erro ao enviar para ${numeroFormatado}:`,
              result.message
            );
          }
        } catch (err) {
          console.error(
            `❌ Falha de rede ao enviar para ${numeroFormatado}:`,
            err
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 30000)); // delay entre envios
      }

      alert("Mensagens enviadas com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao processar a planilha:", error);
      alert("Erro durante a leitura da planilha.");
    } finally {
      setIsSending(false);
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                     Status da conexão
                    </CardTitle>
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{sessions.length}</div>
                  </CardContent>
                </Card>

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

              {/* Seções Principais */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conectar WhatsApp */}
                {user?.email && (
                  <WhatsappSessionCard sessionName={user.email} />
                )}

                {/* Upload de Contatos */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Lista de Contatos
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Upload da planilha (.xlsx, .csv)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer"
                          >
                            <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Selecionar arquivo
                            </span>
                          </label>
                          <Input
                            id="file-upload"
                            type="file"
                            accept=".xlsx,.csv,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            .xlsx, .csv, .xls
                          </p>
                        </div>

                        {file && (
                          <div className="mt-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700 dark:text-green-300 text-sm font-medium truncate">
                                {file.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mensagem e Envio */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Send className="w-5 h-5 text-purple-600" />
                      Enviar Mensagem
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Mensagem para todos os contatos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col">
                      <Textarea
                        placeholder="Digite sua mensagem aqui..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 resize-none"
                        rows={6}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {message.length} caracteres
                      </p>
                    </div>

                    <Button
                      onClick={sendMessages}
                      disabled={isSending || !file || !message.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 mt-4"
                      size="sm"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensagens
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  );
}
