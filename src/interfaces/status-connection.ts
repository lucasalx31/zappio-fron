export type ConnectionStatus = 
  | "disconnected" 
  | "connecting" 
  | "qr_required" 
  | "connected" 
  | "error" 
  | 'not_initialized';

export interface StatusData {
  service: string;
  session: {
    [key: string]: ConnectionStatus;
  };
}
