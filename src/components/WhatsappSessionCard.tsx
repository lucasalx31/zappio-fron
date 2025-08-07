"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import io from "socket.io-client";

type Props = {
  sessionName: string; // Ex: email do usuário
};

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");

export function WhatsappSessionCard({ sessionName }: Props) {
  const [status, setStatus] = useState("Aguardando conexão...");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const conectarSessao = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionName }),
      });

      const result = await response.json();
      setStatus(result.message || "Comando enviado. Aguarde o QR Code.");
    } catch (err) {
      console.error(err);
      setStatus("Erro ao iniciar sessão.");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!sessionName) return;

    socket.emit("subscribe-to-session", sessionName);

    socket.on("qr-code", (data) => {
      if (data.message.includes(sessionName)) {
        setQrCode(data.base64);
        setStatus("Escaneie o QR Code para conectar.");
      }
    });

    socket.on("status-update", (data) => {
      if (data.session === sessionName) {
        setStatus(data.message);
        if (["CONNECTED", "isLogged", "chatsAvailable"].includes(data.status)) {
          setQrCode(null);
        }
        if (data.status === "CLOSED") {
          setQrCode(null);
        }
      }
    });

    socket.on("init-error", (data) => {
      if (data.message.includes(sessionName)) {
        setStatus(`Erro: ${data.message}`);
      }
    });

    return () => {
      socket.off("qr-code");
      socket.off("status-update");
      socket.off("init-error");
    };
  }, [sessionName]);

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
