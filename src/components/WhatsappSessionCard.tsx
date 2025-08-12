"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageCircle } from "lucide-react";
import io, { Socket } from "socket.io-client";

type Props = {
  sessionName: string;   // ex: "lucas@gmail.com"
  numsession: string;    // ex: "9f79529f-dde0-4479-9078-46fdb994e394"
};

export function WhatsappSessionCard({ sessionName, numsession }: Props) {
  const [status, setStatus] = useState("Aguardando conexão...");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL

  const socket: Socket = useMemo(() => io(SOCKET_URL, { autoConnect: true }), [SOCKET_URL]);

  const conectarSessao = async () => {
    if (!sessionName || !numsession) return;
    setIsConnecting(true);
    try {
      const response = await fetch(`${API_URL}/conectar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numsession }),
      });
      const result = await response.json().catch(() => ({}));
      setStatus(result.message || "Comando enviado. Aguarde o QR Code.");
    } catch {
      setStatus("Erro ao iniciar sessão.");
    } finally {
      setIsConnecting(false);
    }
  };

  const desconectarSessao = async () => {
    setIsClosing(true);
    try {
      const res = await fetch(`${API_URL}/desconectar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numsession }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? "Falha ao desconectar a sessão");
      setStatus(data?.message ?? "Sessão desconectada.");
      setQrCode(null);
    } catch (e: any) {
      setStatus(e?.message ?? "Erro ao desconectar sessão.");
    } finally {
      setIsClosing(false);
    }
  };

  useEffect(() => {
    if (!sessionName) return;
    socket.emit("subscribe-to-session", sessionName);

    const onQr = (data: any) => {
      if (data?.message?.includes(sessionName)) {
        setQrCode(data.base64);
        setStatus("Escaneie o QR Code para conectar.");
      }
    };

    const onStatus = (data: any) => {
      if (data?.session === sessionName) {
        setStatus(data.message ?? "Atualizando status...");
        if (["CONNECTED", "isLogged", "chatsAvailable", "CLOSED"].includes(data.status)) {
          setQrCode(null);
        }
      }
    };

    const onInitError = (data: any) => {
      if (data?.message?.includes(sessionName)) setStatus(`Erro: ${data.message}`);
    };

    socket.on("qr-code", onQr);
    socket.on("status-update", onStatus);
    socket.on("init-error", onInitError);

    return () => {
      socket.off("qr-code", onQr);
      socket.off("status-update", onStatus);
      socket.off("init-error", onInitError);
    };
  }, [socket, sessionName]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          Conectar WhatsApp
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="text-sm mt-2">{status}</div>

        <div className="flex gap-2">
          <Button className="bg-green-600" onClick={conectarSessao} disabled={isConnecting || isClosing}>
            {isConnecting ? "Conectando..." : "Conectar sessão"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isConnecting || isClosing}>
                {isClosing ? "Encerrando..." : "Encerrar sessão"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar esta sessão?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={desconectarSessao}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {qrCode && (
          <img
            src={qrCode}
            alt="QR Code"
            className="w-64 h-64 border border-dashed border-gray-400 rounded-lg mx-auto"
          />
        )}
      </CardContent>
    </Card>
  );
}
