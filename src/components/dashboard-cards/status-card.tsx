'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, ZapOff, QrCode, Loader2 } from 'lucide-react';
import { type StatusData, type ConnectionStatus } from "@/interfaces/status-connection";
import { useUser } from "@/contexts/userContext";

interface StatusCardProps {
  onStatusChange?: (data: StatusData) => void;
}

export function StatusCard({ onStatusChange }: StatusCardProps) {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/status/${user?.id}`); 
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

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 5000);
    return () => clearInterval(intervalId);
  }, [API_URL, onStatusChange]);

  if (isLoading) {
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

  const sessions = statusData?.sessions ?? {};
  const connectedSessions = Object.values(sessions).filter((s: ConnectionStatus) => s === 'connected').length;
  const qrRequiredSessions = Object.values(sessions).filter((s: ConnectionStatus) => s === 'qr_required').length;

  let mainStatus: 'connected' | 'action_required' | 'offline' = 'offline';
  if (connectedSessions > 0) {
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
