"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { createSession } from "@/lib/api/whatsapp/qrcode";

type Props = {
  sessionName: string;
  onSessionCreated?: (sessionName: string) => void;
};

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

export function QRCodeDisplay({ sessionName, onSessionCreated }: Props) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState("Aguardando conexão...");

  useEffect(() => {
    const iniciar = async () => {
      try {
        const created = await createSession(sessionName);
        setStatus("Sessão criada, aguardando QR Code...");
        onSessionCreated?.(created.sessionName || sessionName);

        socket.emit("subscribe-to-session", sessionName);
      } catch (error) {
        console.error("Erro ao criar sessão:", error);
        setStatus("Erro ao criar sessão.");
      }
    };

    iniciar();

    socket.on("qr-code", (data) => {
      if (data.message.includes(sessionName)) {
        setQrCode(data.base64);
        setStatus("Escaneie o QR Code para conectar.");
      }
    });

    socket.on("status-update", (data) => {
      if (data.session === sessionName) {
        if (data.status === "CONNECTED" || data.status === "chatsAvailable" || data.status === "isLogged") {
          setStatus("✅ Sessão conectada com sucesso!");
          setQrCode(null);
        } else if (data.status === "CLOSED") {
          setStatus("❌ Sessão encerrada.");
          setQrCode(null);
        } else {
          setStatus(`Status: ${data.status}`);
        }
      }
    });

    return () => {
      socket.off("qr-code");
      socket.off("status-update");
    };
  }, [sessionName]);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm">{status}</p>
      {qrCode && <img src={qrCode} alt="QR Code do WhatsApp" className="w-64 h-64 border rounded" />}
    </div>
  );
}
