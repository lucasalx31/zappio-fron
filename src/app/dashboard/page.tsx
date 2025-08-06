"use client";

import type React from "react";

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
import { WhatsAppSidebar } from "../../components/whatsapp-sidebar";
import Image from "next/image";
import { useUser } from "@/contexts/userContext";

interface UserData {
  id: string;
  email: string;
  createdAt: string;
}

export default function Dashboard() {
  const [qrCode, setQrCode] = useState("");
  const [instanceId, setInstanceId] = useState("64B95B224CAEI");
  const [isConnecting, setIsConnecting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    // Recuperar dados do usuário logado
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const generateQRCode = async () => {
    setIsConnecting(true);
    setTimeout(() => {
      setQrCode("/placeholder.svg?height=150&width=150&text=QR+Code");
      setIsConnecting(false);
    }, 2000);
  };

  const reconnectWhatsApp = () => {
    setQrCode("");
    generateQRCode();
  };

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
    setTimeout(() => {
      setIsSending(false);
      alert("Mensagens enviadas com sucesso!");
    }, 3000);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <WhatsAppSidebar />
        <div className="flex flex-col flex-1 overflow-auto bg-background w-screen">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-6">
              <h1 className="text-xl font-semibold">
                Olá {userData?.email || user?.name || "Usuário"}!
              </h1>
              {/* <div className="flex items-center gap-2">
                <Button className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                  <span>Nova Campanha</span>
                </Button>
              </div> */}
            </div>
          </header>

          <main className="container mx-auto p-4 md:p-6 flex-1 overflow-auto">
            <div className="flex flex-col gap-6">
              {/* Cards de Estatísticas  - to do */}

              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Este mês</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contatos Ativos</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Total de contatos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                    <Send className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0%</div>
                    <p className="text-xs text-muted-foreground">Mensagens entregues</p>
                  </CardContent>
                </Card>
              </div> */}

              {/* Seções Principais */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conectar WhatsApp */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      Conectar WhatsApp
                    </CardTitle>
                    <CardDescription className="text-sm">
                      ID:{" "}
                      <span className="text-blue-600 font-mono">
                        {instanceId}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-lg mb-4 min-h-[200px]">
                      {isConnecting ? (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Gerando QR...
                          </p>
                        </div>
                      ) : qrCode ? (
                        <Image
                          src={qrCode || "/placeholder.svg"}
                          width={120}
                          height={120}
                          alt="QR Code"
                          className="border rounded"
                        />
                      ) : (
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">
                            Gerar QR Code
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {!qrCode ? (
                        <Button
                          onClick={generateQRCode}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          Conectar
                        </Button>
                      ) : (
                        <Button
                          onClick={reconnectWhatsApp}
                          variant="outline"
                          className="w-full bg-transparent"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reconectar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
