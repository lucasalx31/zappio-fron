export type ConnectionStatus = 
  | "disconnected" 
  | "connecting" 
  | "qr-ready" 
  | "connected" 
  | "error" 
  | 'not_initialized';

export interface StatusData {
  service: string;
  sessions: {
    [key: string]: ConnectionStatus;
  };
}
