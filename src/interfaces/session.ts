export interface SessionWhatsapp {
    sessionName: string;
    sessionId: number;
    status: string;
    isConnected?: boolean;
    batteryLevel?: number;
    createdAt: string;
    lastActivity: string;
    reconnectAttempts: number;
    connectionStatus?: {
      status: string;
      timestamp: string;
      lastUpdate: string;
    };
  }