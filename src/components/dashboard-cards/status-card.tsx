'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, ZapOff, QrCode, Loader2 } from 'lucide-react';
import { type StatusData, type ConnectionStatus } from "@/interfaces/status-connection";
import { useUser } from "@/contexts/userContext";
import { NGROK_SKIP_HEADER } from "@/lib/api/http";

interface StatusCardProps {
  onStatusChange?: (data: StatusData) => void;
}

export function StatusCard({ onStatusChange }: StatusCardProps) {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    // MUDANÇA 1: Adicionar uma guarda para não executar se o usuário não estiver logado.
    if (!user?.id) {
      setIsLoading(false); // Para de carregar se não houver usuário
      setStatusData(null); // Limpa dados antigos
      return;
    }

    const fetchStatus = async () => {
      // O setIsLoading(true) pode ser colocado aqui se você quiser o feedback de loading a cada requisição
      try {
        // A URL agora usará o user.id que sabemos que existe
        const response = await fetch(`${API_URL}/status/${user.id}`, {
          headers: { ...NGROK_SKIP_HEADER },
        });
        if (!response.ok) {
          throw new Error(`Falha ao buscar dados de status: ${response.statusText}`);
        }
        const data: StatusData = await response.json();
        setStatusData(data);
        if (onStatusChange) {
          onStatusChange(data);
        }
      } catch (error) {
        console.error("Erro no fetch:", error);
        setStatusData(null); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus(); // Executa a primeira vez
    const intervalId = setInterval(fetchStatus, 5000); // E depois a cada 5 segundos

    // A função de limpeza irá parar o intervalo quando o componente for desmontado
    // ou quando o user.id mudar, evitando múltiplas chamadas simultâneas.
    return () => clearInterval(intervalId);

  // MUDANÇA 2: Adicionar 'user' na lista de dependências!
  // Isso garante que o useEffect será re-executado quando o usuário logar.
  }, [API_URL, onStatusChange, user]);

  if (isLoading) {
    // ... o código de loading permanece o mesmo ...
    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Conexão</CardTitle>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">Carregando dados...</p>
          </CardContent>
        </Card>
      );
  }

  // MUDANÇA 3: Usar 'session' (singular) para corresponder à API.
  const sessions = statusData?.session ?? {};
  
  // O resto da lógica de renderização deve funcionar agora
  const connectedSessions = Object.values(sessions).filter((s: ConnectionStatus) => s === 'connected').length;
  const qrRequiredSessions = Object.values(sessions).filter((s: ConnectionStatus) => s === 'qr_required').length;
  
  // ... o resto do seu componente permanece o mesmo ...
  let mainStatus: 'connected' | 'action_required' | 'offline' = 'offline';
  if(!statusData){
    mainStatus = 'offline';
  } else if (connectedSessions > 0) {
    mainStatus = 'connected';
  } else if (qrRequiredSessions > 0) {
    mainStatus = 'action_required';
  }
 
   const statusInfo = {
     connected: { title: 'Sessão Ativa', icon: <Zap className="h-4 w-4 text-green-500" />, displayText: 'Conectado', textColor: 'text-green-500', bgColor: 'bg-green-500/10 border-green-500/20' },
     action_required: { title: 'Ação Necessária', icon: <QrCode className="h-4 w-4 text-yellow-500" />, displayText: 'Verificar', textColor: 'text-yellow-500', bgColor: 'bg-yellow-500/10 border-yellow-500/20' },
     offline: { title: 'Status da Conexão', icon: <ZapOff className="h-4 w-4 text-red-500" />, displayText: 'Desconectado', textColor: 'text-red-500', bgColor: 'bg-red-500/10 border-red-500/20' }
   };
 
   const currentStatus = statusInfo[mainStatus];
 
   return (
     <Card className={`transition-colors ${currentStatus.bgColor}`}>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
         <CardTitle className="text-sm font-medium">
           {currentStatus.title}
         </CardTitle>
         {currentStatus.icon}
       </CardHeader>
       <CardContent>
         <div className={`text-2xl font-bold ${currentStatus.textColor}`}>
           {currentStatus.displayText}
         </div>
       </CardContent>
     </Card>
   );
}