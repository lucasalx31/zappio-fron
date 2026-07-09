"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog"
import { MessageCircle, Wifi, WifiOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import io, { type Socket } from "socket.io-client"
import { type ConnectionStatus } from "@/interfaces/status-connection";
import { NGROK_SKIP_HEADER } from "@/lib/api/http";

type QrData = { message?: string; base64: string };
type StatusUpdateData = { session?: string; message?: string; status: string };
type InitErrorData = { message?: string };

type Props = {
  sessionName: string
  numsession: string
  initialStatus: ConnectionStatus; 
}

export function WhatsappSessionCard({ sessionName, numsession, initialStatus }: Props) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(initialStatus)

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL

  // transports: ["websocket"] evita a fase inicial de long-polling do socket.io,
  // que era bloqueada pela pagina de aviso do ngrok e impedia o QR code de chegar.
  const socket: Socket = useMemo(
    () => io(SOCKET_URL, { autoConnect: true, transports: ["websocket"] }),
    [SOCKET_URL]
  )

  const getStatusConfig = (status: ConnectionStatus) => {
    switch (status) {
      case "connected":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950",
          borderColor: "border-green-200 dark:border-green-800",
        }
      case "connecting":
        return {
          icon: Loader2,
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950",
          borderColor: "border-blue-200 dark:border-blue-800",
        }
      case "qr_required":
        return {
          icon: MessageCircle,
          color: "text-orange-600",
          bgColor: "bg-orange-50 dark:bg-orange-950",
          borderColor: "border-orange-200 dark:border-orange-800",
        }
      case "error":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-950",
          borderColor: "border-red-200 dark:border-red-800",
        }
      default:
        return {
          icon: WifiOff,
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-950",
          borderColor: "border-gray-200 dark:border-gray-800",
        }
    }
  }

  const encerrarSessao = async () => {
      await fetch(`${API_URL}/encerrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...NGROK_SKIP_HEADER },
        body: JSON.stringify({ numsession }),
      });
  };

  const conectarSessao = async () => {
    if (!sessionName || !numsession) return;
  
    if (connectionStatus === "error") {
      await encerrarSessao();
    } 
    setIsConnecting(true);
    setConnectionStatus("connecting");
    try {
      const res = await fetch(`${API_URL}/conectar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...NGROK_SKIP_HEADER },
        body: JSON.stringify({ numsession }),
      });

      if (!res.ok) {
        throw new Error("API retornou um erro ao conectar.");
      }
    } catch (error) {
      console.error("Falha na tentativa de conexão:", error);
      setConnectionStatus("error");
    } finally {
      setIsConnecting(false);
    }
  };

  const desconectarSessao = async () => {
    setIsClosing(true)
    try {
      const res = await fetch(`${API_URL}/desconectar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...NGROK_SKIP_HEADER },
        body: JSON.stringify({ numsession }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message ?? "Falha ao desconectar a sessão")
      setQrCode(null)
      setConnectionStatus("disconnected")
    } catch {
      setConnectionStatus("error")
    } finally {
      setIsClosing(false)
    }
  }

  useEffect(() => {
    setConnectionStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (!sessionName) return
    socket.emit("subscribe-to-session", sessionName)

    const onQr = (data: QrData) => {
      if (data?.message?.includes(sessionName)) {
        setQrCode(data.base64)
        setConnectionStatus("qr_required")
      }
    }

    const onStatus = (data: StatusUpdateData) => {
      if (data?.session === sessionName) {
        if (["CONNECTED", "isLogged", "chatsAvailable"].includes(data.status)) {
          setQrCode(null)
          setConnectionStatus("connected")
        } else if (data.status === "CLOSED") {
          setQrCode(null)
          setConnectionStatus("disconnected")
        } else if (data.status === "INITIALIZING") {
          setConnectionStatus("connecting")
        } else if (["qrReadError", "autocloseCalled", "browserClose"].includes(data.status)) {
          // Sessao expirou/falhou no backend (ex: QR nao foi escaneado a tempo).
          // Sem isso o card ficava travado em "Preparando conexao..." para sempre.
          setQrCode(null)
          setConnectionStatus("error")
        }
      }
    }

    const onInitError = (data: InitErrorData) => {
      if (data?.message?.includes(sessionName)) {
        setConnectionStatus("error")
      }
    }

    socket.on("qr-code", onQr)
    socket.on("status-update", onStatus)
    socket.on("init-error", onInitError)

    return () => {
      socket.off("qr-code", onQr)
      socket.off("status-update", onStatus)
      socket.off("init-error", onInitError)
    }
  }, [socket, sessionName])

  const statusConfig = getStatusConfig(connectionStatus)
  const StatusIcon = statusConfig.icon

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StatusIcon
              className={`w-5 h-5 ${statusConfig.color} ${connectionStatus === "connecting" ? "animate-spin" : ""}`}
            />
            Conectar WhatsApp
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {qrCode ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className={`p-4 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 transition-all duration-300`}
            >
              <img src={qrCode || "/placeholder.svg"} alt="QR Code WhatsApp" className="w-48 h-48 rounded-lg" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">Abra o WhatsApp no seu celular</p>
              <p className="text-xs text-muted-foreground">
                Vá em <strong>Configurações → Aparelhos conectados → Conectar um aparelho</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div
              className={`p-8 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 text-center transition-all duration-300`}
            >
              <StatusIcon
                className={`w-12 h-12 ${statusConfig.color} mx-auto mb-3 ${connectionStatus === "connecting" ? "animate-spin" : ""}`}
              />
              <p className="text-sm font-medium text-foreground mb-1">
                {connectionStatus === "connected"
                  ? "WhatsApp Conectado!"
                  : connectionStatus === "connecting"
                    ? "Preparando conexão..."
                    : connectionStatus === "error"
                      ? "Erro na conexão"
                      : "Pronto para conectar"}
              </p>
              <p className="text-xs text-muted-foreground">
                {connectionStatus === "connected"
                  ? "Sua conta está ativa e pronta para enviar mensagens"
                  : connectionStatus === "connecting"
                    ? "Aguarde enquanto preparamos sua sessão"
                    : connectionStatus === "error"
                      ? "Tente conectar novamente"
                      : 'Clique em "Conectar sessão" para começar'}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
            onClick={conectarSessao}
            disabled={
              isConnecting ||
              isClosing ||
              connectionStatus === "connected" ||
              connectionStatus === "connecting" ||
              (connectionStatus === "qr_required" && !!qrCode)
            }
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : connectionStatus === "connected" ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Conectado
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Conectar sessão
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isConnecting || isClosing} className="flex-1 cursor-pointer">
                {isClosing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Encerrando...
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 mr-2" />
                    Encerrar sessão
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar esta sessão?</AlertDialogTitle>
                <p className="text-sm text-muted-foreground">
                  Isso irá desconectar seu WhatsApp e você precisará escanear o QR code novamente.
                </p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={desconectarSessao}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
